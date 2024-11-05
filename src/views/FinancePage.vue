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
                <img :src="userProfile.profile_photo" :alt="userProfile.username" class="rounded-circle profile-photo mb-3 mb-md-0 me-md-4">
                <div class="text-center text-md-start">
                  <h2 class="card-title mb-2">{{ userProfile.username }}'s Financial Overview</h2>
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
              <h3 class="card-title mb-4">Earnings Graph</h3>
              <div class="d-flex justify-content-between mb-4">
                <select v-model="timeFrame" class="form-select w-auto">
                  <option value="month">By Month</option>
                  <option value="week">By Week</option>
                </select>
                <!-- <select v-model="selectedClass" class="form-select w-auto">
                  <option value="All">All Classes</option>
                  <option v-for="classItem in classesData" :key="classItem.classId" :value="classItem.title"> -->
                    <!-- {{ classItem.title }}
                  </option>
                </select> -->
              </div>
              <div ref="earningsGraphRef" style="height: 300px;"></div>
            </div>
          </div>

          <!-- Earnings Summary Section -->
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <h3 class="card-title mb-4">Earnings Summary</h3>
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
                  <strong>Total Lifetime Earnings :</strong> ${{ totalEarnings.toFixed(2) }}
                </li>
                <li class="mb-3">
                  <strong>Total Lifetime Classes:</strong> {{ totalClasses }}
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
              <h3 class="card-title mb-4">Recent Earnings</h3>
              <ul class="list-group list-group-flush">
                <li v-for="(earning, index) in recentEarnings" :key="index" class="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>${{ earning.amount.toFixed(2) }}</strong>
                    <br>
                    <small class="text-muted">{{ formatDate(earning.transactionDate) }}</small>
                  </div>
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
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase_config';
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const userProfile = ref({});
const earningsData = ref([]);
const classesData = ref([]);
const loading = ref(true);
const error = ref(null);
const timeFrame = ref('month');
const selectedClass = ref('All');
const earningsGraphRef = ref(null);
const summaryGraphRef = ref(null);

const totalEarnings = computed(() => {
  return earningsData.value.reduce((sum, earning) => sum + earning.amount, 0);
});

const totalClasses = computed(() => {
  return classesData.value.length;
});

const averageEarningsPerClass = computed(() => {
  return totalClasses.value > 0 ? totalEarnings.value / totalClasses.value : 0;
});

const recentEarnings = computed(() => {
  return [...earningsData.value]
    .sort((a, b) => b.transactionDate - a.transactionDate)
    .slice(0, 5);
});

const filteredData = computed(() => {
  if (selectedClass.value === 'All') {
    return earningsData.value.filter(earning => earning.transactionDate instanceof Date);
  } else {
    const selectedClassData = classesData.value.find(c => c.title === selectedClass.value);
    return selectedClassData ? [{ amount: selectedClassData.earnings, transactionDate: new Date() }] : [];
  }
});

onMounted(refreshUserProfile);

watch([timeFrame, selectedClass], async () => {
  await nextTick();
  drawEarningsGraph();
  drawSummaryGraph();
});

async function refreshUserProfile() {
  loading.value = true;
  error.value = null;
  const user = auth.currentUser;
  if (user) {
    try {
      const financialData = await fetchFinancialData(user.uid);
      if (financialData) {
        userProfile.value = financialData.userProfile;
        earningsData.value = financialData.finances;
        classesData.value = financialData.classes;
        await nextTick();
        drawEarningsGraph();
        drawSummaryGraph();
      } else {
        error.value = 'Financial data not found.';
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

async function fetchFinancialData(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const finances = userData.finances || [];
      const postedClasses = userData.posted_classes || [];

      // Process finances
      const processedFinances = finances.map(finance => {
        let transactionDate;
        if (finance.transaction_date && typeof finance.transaction_date.toDate === 'function') {
          transactionDate = finance.transaction_date.toDate();
        } else if (finance.transaction_date instanceof Date) {
          transactionDate = finance.transaction_date;
        } else {
          transactionDate = new Date(finance.transaction_date);
        }
        return {
          amount: parseFloat(finance.amount),
          transactionDate: transactionDate,
        };
      });

      // Process posted classes
      const processedClasses = postedClasses.map(classItem => ({
        classId: classItem.class_id,
        title: classItem.title,
        currentEnrollment: classItem.current_enrollment,
        price: classItem.price,
        earnings: classItem.current_enrollment * classItem.price
      }));

      return {
        userProfile: {
          username: userData.username,
          profile_photo: userData.profile_photo
        },
        finances: processedFinances,
        classes: processedClasses
      };
    } else {
      console.error('User document not found');
      return null;
    }
  } catch (error) {
    console.error('Error fetching financial data:', error);
    throw error;
  }
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
    .domain(d3.extent(filteredData.value, d => d.transactionDate))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(filteredData.value, d => d.amount)])
    .range([height, 0]);

  const line = d3.line()
    .x(d => x(d.transactionDate))
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
    .filter(d => d.transactionDate instanceof Date && d.transactionDate >= startDate)
    .reduce((sum, d) => sum + d.amount, 0);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
</script>

<style scoped>
.profile-view {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.container-fluid {
  max-width: 1200px;

}

.card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.card-title {
  color: #333;
  font-weight: 600;
}

.gradient-border {
  border-top: 4px solid;
  border-image-slice: 1;
  border-image-source: linear-gradient(to right, #5a7dee, #4e6dd2);
}

.btn-primary {
  background-color: #5a7dee;
  border-color: #5a7dee;
}

.btn-primary:hover {
  background-color: #4e6dd2;
  border-color: #4e6dd2;
}

.text-primary {
  color: #5a7dee !important;
}

.bg-light {
  background-color: #f8f9fa !important;
}

.list-group-item {
  border: none;
  padding: 0.75rem 1.25rem;
  background-color: transparent;
  transition: background-color 0.2s ease-in-out;
}

.list-group-item:hover {
  background-color: #f1f3f5;
}

.profile-photo {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .profile-photo {
    width: 100px;
    height: 100px;
  }
}
</style>