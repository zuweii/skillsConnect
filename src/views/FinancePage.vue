<template>
    <div class="profile-view">
      <div v-if="loading" class="container-fluid d-flex justify-content-center align-items-center" style="height: 100vh;">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else-if="error" class="container-fluid mt-4">
        <div class="alert alert-danger" role="alert">
          {{ error }}
        </div>
      </div>
      <div v-else class="container-fluid px-4">
        <!-- Finance Header -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card shadow-sm gradient-border">
              <div class="card-body d-flex flex-column flex-md-row align-items-center justify-content-between p-4">
                <div class="d-flex flex-column flex-md-row align-items-center mb-3 mb-md-0">
                  <img :src="userProfile.profile_photo" :alt="userProfile.username" class="rounded-circle mb-3 mb-md-0 me-md-4" style="width: 150px; height: 150px; object-fit: cover;">
                  <div class="text-center text-md-start">
                    <h2 class="card-title mb-2">{{ userProfile.username }}'s Finance Overview</h2>
                    <div class="d-flex align-items-center justify-content-center justify-content-md-start mb-2">
                      <span class="me-2">Total Earnings:</span>
                      <span class="font-weight-bold">${{ totalEarnings.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Main Content -->
        <div class="row">
          <!-- Left Column: Earnings Graph and Summary -->
          <div class="col-lg-8">
            <!-- Earnings Graph Section -->
            <div class="card shadow-sm mb-4">
              <div class="card-body">
                <h3 class="card-title mb-4">Earning Insights</h3>
                <div class="d-flex justify-content-between mb-4">
                  <select v-model="timeFrame" class="form-select w-auto">
                    <option value="month">By Month</option>
                    <option value="week">By Week</option>
                  </select>
                  <select v-model="selectedClass" class="form-select w-auto">
                    <option value="All">All Classes</option>
                    <option v-for="className in uniqueClasses" :key="className" :value="className">
                      {{ className }}
                    </option>
                  </select>
                </div>
                <div ref="earningsGraphRef" style="height: 300px;"></div>
              </div>
            </div>
  
            <!-- Earnings Summary Section -->
            <div class="card shadow-sm mb-4">
              <div class="card-body">
                <h3 class="card-title mb-4">Earning Summary</h3>
                <div ref="summaryGraphRef" style="height: 300px;"></div>
              </div>
            </div>
          </div>
  
          <!-- Right Column: Quick Stats and Earnings Details -->
          <div class="col-lg-4">
            <!-- Quick Stats Section -->
            <div class="card shadow-sm mb-4">
              <div class="card-body">
                <h3 class="card-title mb-4">Quick Stats</h3>
                <ul class="list-unstyled">
                  <li class="mb-3">
                    <strong>Total Earnings:</strong> ${{ totalEarnings.toFixed(2) }}
                  </li>
                  <li class="mb-3">
                    <strong>Total Classes:</strong> {{ totalClasses }}
                  </li>
                  <li class="mb-3">
                    <strong>Average Earnings per Class:</strong> ${{ averageEarningsPerClass.toFixed(2) }}
                  </li>
                </ul>
              </div>
            </div>
  
            <!-- Earnings Details Section -->
            <div class="card shadow-sm">
              <div class="card-body">
                <h3 class="card-title mb-4">Recent Transactions</h3>
                <ul class="list-group list-group-flush">
                  <li v-for="(earning, index) in recentEarnings" :key="index" class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{{ earning.class }}</strong>
                      <br>
                      <small class="text-muted">{{ formatDate(earning.date) }}</small>
                    </div>
                    <span class="badge bg-primary rounded-pill">${{ earning.amount.toFixed(2) }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import * as d3 from 'd3';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase_config';
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const userProfile = ref({});
const earningsData = ref([]);
const loading = ref(true);
const error = ref(null);
const timeFrame = ref('month');
const selectedClass = ref('All');
const earningsGraphRef = ref(null);
const summaryGraphRef = ref(null);

const uniqueClasses = computed(() => {
  return ['All', ...new Set(earningsData.value.map(d => d.class))];
});

const totalEarnings = computed(() => {
  return earningsData.value.reduce((sum, earning) => sum + earning.amount, 0);
});

const totalClasses = computed(() => {
  return new Set(earningsData.value.map(earning => earning.class)).size;
});

const averageEarningsPerClass = computed(() => {
  return totalClasses.value > 0 ? totalEarnings.value / totalClasses.value : 0;
});

const recentEarnings = computed(() => {
  return [...earningsData.value]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
});

const filteredData = computed(() => {
  return selectedClass.value === 'All'
    ? earningsData.value
    : earningsData.value.filter(d => d.class === selectedClass.value);
});

onMounted(refreshUserProfile);

watch([timeFrame, selectedClass], () => {
  nextTick(() => {
    drawEarningsGraph();
    drawSummaryGraph();
  });
});

async function refreshUserProfile() {
  loading.value = true;
  error.value = null;
  const user = auth.currentUser;
  if (user) {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        userProfile.value = userDoc.data();
        await fetchEarningsData(userProfile.value.username);
        nextTick(() => {
          drawEarningsGraph();
          drawSummaryGraph();
        });
      } else {
        error.value = 'User profile not found.';
      }
    } catch (err) {
      error.value = `Error: ${err.message}`;
    } finally {
      loading.value = false;
    }
  } else {
    error.value = "User not authenticated";
    loading.value = false;
  }
}

async function fetchEarningsData(username) {
  const classesRef = collection(db, 'classes');
  const q = query(classesRef, where('teacher_username', '==', username));
  const querySnapshot = await getDocs(q);

  const earnings = [];
  querySnapshot.forEach(doc => {
    const classData = doc.data();
    const amount = classData.current_enrollment * classData.price;
    earnings.push({
      date: new Date(classData.start_date).toISOString().split('T')[0],
      class: classData.title,
      amount: amount
    });
  });

  earningsData.value = earnings;
}

function drawEarningsGraph() {
  if (!earningsGraphRef.value) return;

  const svg = d3.select(earningsGraphRef.value);
  svg.selectAll("*").remove(); // Clear previous chart

  const containerWidth = earningsGraphRef.value.clientWidth;
  const containerHeight = earningsGraphRef.value.clientHeight;

  if (!containerWidth || !containerHeight) {
    console.error('Container dimensions are not available');
    return;
  }

  const margin = { top: 20, right: 30, bottom: 30, left: 60 };
  const width = containerWidth - margin.left - margin.right;
  const height = containerHeight - margin.top - margin.bottom;

  const chart = svg.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  if (filteredData.value.length === 0) {
    chart.append("text")
      .attr("x", width / 2)
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .text("No data available");
    return;
  }

  const x = d3.scaleTime()
    .domain(d3.extent(filteredData.value, d => new Date(d.date)))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(filteredData.value, d => d.amount)])
    .range([height, 0]);

  const line = d3.line()
    .x(d => x(new Date(d.date)))
    .y(d => y(d.amount));

  chart.append("path")
    .datum(filteredData.value)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", line);

  chart.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  chart.append("g")
    .call(d3.axisLeft(y));

  chart.append("text")
    .attr("x", width / 2)
    .attr("y", 0 - margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text(`Earnings ${timeFrame.value === 'month' ? 'by Month' : 'by Week'}`);
}

function drawSummaryGraph() {
  if (!summaryGraphRef.value) return;

  const svg = d3.select(summaryGraphRef.value);
  svg.selectAll("*").remove(); // Clear previous chart

  const containerWidth = summaryGraphRef.value.clientWidth;
  const containerHeight = summaryGraphRef.value.clientHeight;

  if (!containerWidth || !containerHeight) {
    console.error('Container dimensions are not available');
    return;
  }

  const margin = { top: 20, right: 30, bottom: 30, left: 60 };
  const width = containerWidth - margin.left - margin.right;
  const height = containerHeight - margin.top - margin.bottom;

  const chart = svg.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const summaryData = [
    { period: 'Last Month', amount: calculateEarnings(1) },
    { period: 'Last 3 Months', amount: calculateEarnings(3) },
    { period: 'Last Year', amount: calculateEarnings(12) }
  ];

  if (summaryData.every(d => d.amount === 0)) {
    chart.append("text")
      .attr("x", width / 2)
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .text("No data available");
    return;
  }

  const x = d3.scaleBand()
    .range([0, width])
    .domain(summaryData.map(d => d.period))
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(summaryData, d => d.amount)])
    .range([height, 0]);

  chart.selectAll(".bar")
    .data(summaryData)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.period))
    .attr("width", x.bandwidth())
    .attr("y", d => y(d.amount))
    .attr("height", d => height - y(d.amount))
    .attr("fill", "steelblue");

  chart.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  chart.append("g")
    .call(d3.axisLeft(y));

  chart.append("text")
    .attr("x", width / 2)
    .attr("y", 0 - margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Earnings Summary");
}

function calculateEarnings(months) {
  const now = new Date();
  const startDate = new Date(now.setMonth(now.getMonth() - months));
  return earningsData.value
    .filter(d => new Date(d.date) >= startDate)
    .reduce((sum, d) => sum + d.amount, 0);
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}
</script>