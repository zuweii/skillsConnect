<template>
    <section class="analytics-overview">
      <h3>Analytics Overview</h3>
      <div class="analytics-charts">
        <div class="chart">
          <h4>New Client Status</h4>
          <img src="../assets/pie-chart.png" alt="New Client Status" />
        </div>
        <div class="chart">
          <h4>Return Clients Status</h4>
          <img src="../assets/bar-chart.png" alt="Return Clients Status" />
        </div>
      </div>
    </section>
  </template>
  
  <script>
  export default {
    props: {
      data: Object
    }
  };
  </script>
  
  <style scoped>
  .analytics-overview {
    padding: 2rem;
  }
  .analytics-charts {
    display: flex;
    gap: 2rem;
  }
  .chart {
    flex: 1;
  }
  </style>
  