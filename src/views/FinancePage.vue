<template>
  <div class="profile-view">
    <!-- Loading Spinner -->
    <div v-if="loading" class="container-fluid d-flex justify-content-center align-items-center" style="height: 100vh;">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error Message -->
    <div v-else-if="error" class="container-fluid mt-4">
      <div class="alert alert-danger" role="alert">
        {{ error }}
      </div>
    </div>

    <!-- Main Content -->
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs Section -->
      <div class="row">
        <div class="col-12 col-lg-8 mb-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <ul class="nav nav-tabs" id="financeTabs" role="tablist">
                <li class="nav-item" role="presentation">
                  <button @click="currentTab = 'earningsGraph'" :class="{ active: currentTab === 'earningsGraph' }"
                    class="nav-link" id="earnings-graph-tab" data-bs-toggle="tab" type="button" role="tab"
                    aria-controls="earnings-graph" aria-selected="true">Earnings Graph</button>
                </li>
                <li class="nav-item" role="presentation">
                  <button @click="currentTab = 'earningsSummary'" :class="{ active: currentTab === 'earningsSummary' }"
                    class="nav-link" id="earnings-summary-tab" data-bs-toggle="tab" type="button" role="tab"
                    aria-controls="earnings-summary" aria-selected="false">Earnings Summary</button>
                </li>
              </ul>

              <div class="tab-content mt-4" id="financeTabsContent">
                <!-- Earnings Graph Section -->
                <div :class="{ 'active show': currentTab === 'earningsGraph' }" class="tab-pane fade" id="earnings-graph"
                  role="tabpanel" aria-labelledby="earnings-graph-tab">
                  <div class="card shadow-sm mb-4">
                    <div class="card-body">
                      <h3 class="card-title mb-4">Recent Earnings</h3>
                      <div ref="earningsGraphRef" class="chart-container"></div>
                    </div>
                  </div>
                </div>

                <!-- Earnings Summary Section -->
                <div :class="{ 'active show': currentTab === 'earningsSummary' }" class="tab-pane fade" id="earnings-summary"
                  role="tabpanel" aria-labelledby="earnings-summary-tab">
                  <div class="card shadow-sm mb-4">
                    <div class="card-body">
                      <h3 class="card-title mb-4">Earnings by Months</h3>
                      <div ref="summaryGraphRef" class="chart-container"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats and Earnings Details -->
        <div class="col-12 col-lg-4">
          <!-- Quick Stats Section -->
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <h3 class="card-title mb-4">Quick Stats</h3>
              <ul class="list-unstyled">
                <li class="mb-3"><strong>Current Month Earnings:</strong> ${{ currentMonthEarnings.toFixed(2) }}</li>
                <li class="mb-3"><strong>Average Earning per Class:</strong> ${{ averageEarningsPerClass.toFixed(2) }}</li>
              </ul>
            </div>
          </div>

          <!-- Earnings Details Section -->
          <div class="card shadow-sm">
            <div class="card-body">
              <h3 class="card-title mb-4">Recent Transactions</h3>
              <ul class="list-group list-group-flush">
                <li v-for="(earning, index) in recentEarnings" :key="index"
                  class="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>${{ earning.amount.toFixed(2) }}</strong><br>
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
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import * as d3 from 'd3';
import { gsap } from 'gsap';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase_config';
import { getAuth } from 'firebase/auth';

// Initialize data and state variables
const auth = getAuth();
const userProfile = ref({});
const earningsData = ref([]);
const classesData = ref([]);
const loading = ref(true);
const error = ref(null);
const currentTab = ref('earningsGraph'); // Default to earnings graph

const earningsGraphRef = ref(null);
const summaryGraphRef = ref(null);

// Computed properties
const totalEarnings = computed(() => earningsData.value.reduce((sum, earning) => sum + earning.amount, 0));
const totalClasses = computed(() => classesData.value.length);
const averageEarningsPerClass = computed(() => totalClasses.value > 0 ? totalEarnings.value / totalClasses.value : 0);

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

// Functions to draw the graphs
function drawEarningsGraph() {
  console.log('Drawing Earnings Graph');
  console.log('earningsGraphRef:', earningsGraphRef.value);
  console.log('earningsData:', earningsData.value);

  if (!earningsGraphRef.value || !earningsData.value || earningsData.value.length === 0) {
    console.log('Returning early from drawEarningsGraph');
    return;
  }

  // Clear previous SVG elements
  const container = d3.select(earningsGraphRef.value);
  container.selectAll("*").remove();

  const svg = container.append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", "0 0 800 400")
    .attr("preserveAspectRatio", "xMidYMid meet");

  const margin = {top: 20, right: 30, bottom: 40, left: 60};
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Convert dates to Date objects if they're not already
  const data = earningsData.value.map(d => ({
    ...d,
    transactionDate: d.transactionDate instanceof Date ? d.transactionDate : new Date(d.transactionDate)
  })).sort((a, b) => a.transactionDate - b.transactionDate);

  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.transactionDate))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.amount) * 1.1])
    .range([height, 0]);

  // Create line
  const line = d3.line()
    .x(d => x(d.transactionDate))
    .y(d => y(d.amount));

  // Add the line
  const path = chart.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#5a7dee")
    .attr("stroke-width", 2)
    .attr("d", line);

  // Add X-axis
  chart.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %d")))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-45)");

  // Add Y-axis
  chart.append("g")
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => `$${d.toLocaleString()}`));

  // Add data points
  const circles = chart.selectAll(".data-point")
    .data(data)
    .enter().append("circle")
    .attr("class", "data-point")
    .attr("cx", d => x(d.transactionDate))
    .attr("cy", d => y(d.amount))
    .attr("r", 5)
    .attr("fill", "#5a7dee");

  // Add tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  circles.on("mouseover", (event, d) => {
    tooltip.transition()
      .duration(200)
      .style("opacity", .9);
    tooltip.html(`Amount: $${d.amount.toFixed(2)}`)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 28) + "px");
  })
  .on("mouseout", () => {
    tooltip.transition()
      .duration(500)
      .style("opacity", 0);
  });

  console.log('Finished drawing Earnings Graph');

  // Animate after a short delay to ensure the graph is rendered
  setTimeout(() => {
    animateEarningsGraph(path, circles);
  }, 100);
}

function animateEarningsGraph(path, circles) {
  console.log('Animating Earnings Graph');
  const length = path.node().getTotalLength();
  
  path
    .attr("stroke-dasharray", length + " " + length)
    .attr("stroke-dashoffset", length)
    .transition()
    .duration(2000)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0);

  circles
    .attr("opacity", 0)
    .transition()
    .delay((d, i) => i * 100)
    .duration(500)
    .attr("opacity", 1);

  gsap.from(d3.selectAll(".tick"), {
    opacity: 0,
    x: -10,
    duration: 0.5,
    stagger: 0.05
  });
}

function drawSummaryGraph() {
  console.log('Drawing Summary Graph');
  console.log('summaryGraphRef:', summaryGraphRef.value);
  console.log('earningsData:', earningsData.value);

  if (!summaryGraphRef.value || !earningsData.value || earningsData.value.length === 0) {
    console.log('Returning early from drawSummaryGraph');
    return;
  }

  // Clear previous SVG elements
  const container = d3.select(summaryGraphRef.value);
  container.selectAll("*").remove();

  const svg = container.append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", "0 0 800 400")
    .attr("preserveAspectRatio", "xMidYMid meet");

  const margin = {top: 20, right: 30, bottom: 40, left: 60};
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const summaryData = [
    { period: getMonthName(0), ...getMonthlyEarnings(0) },
    { period: getMonthName(1), ...getMonthlyEarnings(1) },
    { period: getMonthName(2), ...getMonthlyEarnings(2) }
  ];

  const x = d3.scaleBand()
    .range([0, width])
    .domain(summaryData.map(d => d.period))
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(summaryData, d => d.amount) * 1.1])
    .range([height, 0]);

  // Create bars
  const bars = chart.selectAll(".bar")
    .data(summaryData)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.period))
    .attr("width", x.bandwidth())
    .attr("y", d => y(d.amount))
    .attr("height", d => height - y(d.amount))
    .attr("fill", "#5a7dee");

  // Adding X-axis
  chart.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "middle");

  // Adding Y-axis
  chart.append("g")
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => `$${d.toLocaleString()}`));

  // Add tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  bars.on("mouseover", (event, d) => {
    tooltip.transition()
      .duration(200)
      .style("opacity", .9);
    const tooltipContent = `
      <strong>${d.period}</strong><br/>
      Total Earnings: $${d.amount.toFixed(2)}<br/>
      Transactions: ${d.data.length}
    `;
    tooltip.html(tooltipContent)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 28) + "px");
  })
  .on("mouseout", () => {
    tooltip.transition()
      .duration(500)
      .style("opacity", 0);
  });

  console.log('Finished drawing Summary Graph');

  // Animate after a short delay to ensure the graph is rendered
  setTimeout(() => {
    animateSummaryGraph(bars, y, height);
  }, 100);
}

function animateSummaryGraph(bars, y, height) {
  console.log('Animating Summary Graph');
  gsap.from(bars.nodes(), {
    y: height,
    height: 0,
    duration: 1,
    ease: "power2.out",
    stagger: 0.2
  });

  gsap.from(d3.selectAll(".tick"), {
    opacity: 0,
    x: -10,
    duration: 0.5,
    stagger: 0.05
  });
}

// Helper function to get earnings for specific months
function getMonthlyEarnings(monthOffset) {
  const now = new Date();
  const month = now.getMonth() - monthOffset;
  const year = month < 0 ? now.getFullYear() - 1 : now.getFullYear();
  const adjustedMonth = (month + 12) % 12;

  const startOfMonth = new Date(year, adjustedMonth, 1);
  const endOfMonth = new Date(year, adjustedMonth + 1, 0);

  const monthData = earningsData.value.filter(earning => 
    earning.transactionDate >= startOfMonth && earning.transactionDate <= endOfMonth
  );

  const totalAmount = monthData.reduce((sum, earning) => sum + earning.amount, 0);

  return {
    amount: totalAmount,
    data: monthData
  };
}

// Helper function to get month name for a specific offset
function getMonthName(monthOffset) {
  const now = new Date();
  const month = now.getMonth() - monthOffset;
  const adjustedMonth = (month + 12) % 12;
  return new Date(now.getFullYear(), adjustedMonth).toLocaleString('default', { month: 'long' });
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Lifecycle hooks
onMounted(async () => {
  await refreshUserProfile();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

function handleResize() {
  drawEarningsGraph();
  drawSummaryGraph();
}

async function refreshUserProfile() {
  loading.value = true;
  error.value = null;
  const user = auth.currentUser;
  if (user) {
    try {
      const financialData = await fetchFinancialData(user.uid);
      console.log('Financial data fetched:', financialData);
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

      const processedFinances = finances.map(finance => ({
        amount: parseFloat(finance.amount),
        transactionDate: finance.date.toDate ? finance.date.toDate() : new Date(finance.date),
      }));

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

// Watch for changes in currentTab and redraw graphs accordingly
watch(currentTab, (newTab) => {
  if (newTab === 'earningsGraph') {
    drawEarningsGraph();
  } else if (newTab === 'earningsSummary') {
    drawSummaryGraph();
  }
});

// Watch for changes in earningsData and redraw graphs
watch(earningsData, () => {
  drawEarningsGraph();
  drawSummaryGraph();
});
</script>

<style scoped>
.profile-view {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.tooltip {
  position: absolute;
  text-align: center;
  padding: 8px;
  font: 12px sans-serif;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}

.container-fluid {
  max-width: 1400px;
}

.card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.card-title {
  color: #333;
  font-weight: 600;
}

.gradient-border {
  position: relative;
  border-top: 5px solid #5a7dee;
  border-radius: 0.375rem;
}

.text-primary {
  color: #5a7dee !important;
}

.bg-light {
  background-color: #f8f9fa !important;
}

.profile-photo {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-container {
  width: 100%;
  height: 400px;
  min-height: 400px;
}

.svg-content {
  width: 100%;
  height: 100%;
}

@media (max-width: 768px) {
  .profile-photo {
    width: 100px;
    height: 100px;
  }
}
</style>