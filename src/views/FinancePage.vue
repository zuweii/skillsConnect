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
                <img :src="userProfile.profile_photo" :alt="userProfile.username"
                  class="rounded-circle profile-photo mb-3 mb-md-0 me-md-4">
                <div class="text-center text-md-start">
                  <h2 class="card-title mb-2">{{ userProfile.username }}'s Financial Overview</h2>
                  <div class="d-flex align-items-center justify-content-center justify-content-md-start mb-2">
                    <span class="me-2">Total Earnings To Date:</span>
                    <span class="font-weight-bold">${{ totalEarnings.toFixed(2) }}</span>
                  </div>
                  <div id="tooltip" class="tooltip" style="opacity: 0; position: absolute; pointer-events: none;"></div>
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
                <div class="d-flex justify-content-between mb-4">
                  <select v-model="selectedTimeframe" class="form-select w-auto">
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                  </select>
                </div>
                <!-- <select v-model="selectedClass" class="form-select w-auto">
                  <option value="All">All Classes</option>
                  <option v-for="classItem in classesData" :key="classItem.classId" :value="classItem.title">
                    {{ classItem.title }}
                  </option>
                </select> -->
              </div>
              <div ref="earningsGraphRef" style="height: 350px;"></div>
            </div>
          </div>

          <!-- Earnings Summary Section -->
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <h3 class="card-title mb-4">Earnings Summary</h3>
              <div ref="summaryGraphRef" style="height: 350px;"></div>
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
                  <strong>Current Month Earnings:</strong> ${{ currentMonthEarnings.toFixed(2) }}
                </li>
                <!-- <li class="mb-3">
                  <strong>Earnings to Date: </strong> ${{ totalEarnings.toFixed(2) }}
                </li> -->
                <li class="mb-3">
                  <strong> Active Classes Listed: </strong> {{ totalClasses }}
                </li>
                <li class="mb-3">
                  <strong>Average Earning per Class:</strong> ${{ averageEarningsPerClass.toFixed(2) }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Earnings Details Section -->
          <div class="card shadow-sm">
            <div class="card-body">
              <h3 class="card-title mb-4">Recent Earnings</h3>
              <ul class="list-group list-group-flush">
                <li v-for="(earning, index) in recentEarnings" :key="index"
                  class="list-group-item d-flex justify-content-between align-items-center">
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

const currentMonthEarnings = computed(() => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return earningsData.value
    .filter(earning => earning.transactionDate >= startOfMonth)
    .reduce((sum, earning) => sum + earning.amount, 0);
});

const recentEarnings = computed(() => {
  return [...earningsData.value]
    .sort((a, b) => b.transactionDate - a.transactionDate)
    .slice(0, 5);
});

const selectedTimeframe = ref(7); // Default to last 7 days

const filteredData = computed(() => {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - selectedTimeframe.value + 1); // Set start date to either 7 or 30 days ago

  // Filter data to only include entries within the selected timeframe
  const timeframeData = earningsData.value.filter(earning => earning.transactionDate >= startDate);

  // Group data by day
  const dailyData = d3.group(timeframeData, d => {
    const day = new Date(d.transactionDate);
    day.setHours(0, 0, 0, 0); // Set time to start of the day for consistent grouping
    return day;
  });

  // Format the grouped data for plotting
  return Array.from(dailyData, ([date, values]) => ({
    transactionDate: date,
    amount: d3.sum(values, d => d.amount)
  })).sort((a, b) => a.transactionDate - b.transactionDate); // Sort by date
});

onMounted(async () => {
  await refreshUserProfile();
  drawEarningsGraph();
});

watch([filteredData, selectedTimeframe], async () => {
  await nextTick();
  drawEarningsGraph();
});

watch([earningsData, filteredData], async ([newEarningsData, newFilteredData]) => {
  if (newEarningsData.length > 0 && newFilteredData.length > 0) {
    await nextTick();
    drawEarningsGraph();
    drawSummaryGraph();
  }
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
        loading.value = false;

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
        if (finance.date && typeof finance.date.toDate === 'function') {
          transactionDate = finance.date.toDate(); // Convert Firebase Timestamp to Date
        } else if (finance.date instanceof Date) {
          transactionDate = finance.date;
        } else {
          transactionDate = new Date(finance.date);
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
  if (!earningsGraphRef.value || loading.value) return;

  const svg = d3.select(earningsGraphRef.value);
  svg.selectAll("*").remove(); // Clear previous chart

  const margin = { top: 40, right: 30, bottom: 50, left: 60 };
  const width = earningsGraphRef.value.clientWidth - margin.left - margin.right;
  const height = earningsGraphRef.value.clientHeight - margin.top - margin.bottom;

  const chart = svg.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Define tooltip element
  const tooltip = d3.select("#tooltip");

  // Define scales
  const x = d3.scaleBand()
    .domain(filteredData.value.map(d => d.transactionDate))
    .range([0, width])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(filteredData.value, d => d.amount) * 1.1])
    .range([height, 0]);

  // Draw bars with hover events for tooltip
  chart.selectAll(".bar")
    .data(filteredData.value)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.transactionDate))
    .attr("width", x.bandwidth())
    .attr("y", d => y(d.amount))
    .attr("height", d => height - y(d.amount))
    .attr("fill", "steelblue")
    .on("mouseover", (event, d) => {
      tooltip
        .style("opacity", 1)
        .html(`<strong>${d3.timeFormat("%b %d, %Y")(d.transactionDate)}</strong><br>$${d.amount.toFixed(2)}`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });

  // X-axis
  chart.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %d")))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-45)");

  // Y-axis
  chart.append("g")
    .call(d3.axisLeft(y)
      .ticks(5)
      .tickFormat(d => `$${d.toLocaleString()}`));

  // Title
  chart.append("text")
    .attr("x", width / 2)
    .attr("y", 0 - margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    // .text(`Daily Earnings (${selectedTimeframe.value === 7 ? "Last 7 Days" : "Last 30 Days"})`);
}

function drawSummaryGraph() {
  if (!summaryGraphRef.value) return;

  const svg = d3.select(summaryGraphRef.value);
  svg.selectAll("*").remove(); // clear previous chart

  const margin = { top: 40, right: 30, bottom: 40, left: 60 };
  const width = summaryGraphRef.value.clientWidth - margin.left - margin.right;
  const height = summaryGraphRef.value.clientHeight - margin.top - margin.bottom;

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

  const x = d3.scaleBand()
    .range([0, width])
    .domain(summaryData.map(d => d.period))
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(summaryData, d => d.amount) * 1.1]) 
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
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "middle");

  chart.append("g")
    .call(d3.axisLeft(y)
      .ticks(5)
      .tickFormat(d => `$${d.toLocaleString()}`));

  chart.append("text")
    .attr("x", width / 2)
    .attr("y", 0 - margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    // .text("Earnings Summary");
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

.tooltip {
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  position: absolute;
  text-align: center;
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