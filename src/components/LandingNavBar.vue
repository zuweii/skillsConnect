
<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <a class="navbar-brand" href="#">
        <img src="../assets/logo.png" class="logo p-2" alt="logo" />
      </a>
      <div class="container-fluid justify-content-end">
        <router-link to="/login" class="btn btn-primary">Login</router-link>
      </div>
    </nav>
  </template>
  
  <script>
  export default {
    name: 'LandingNavBar'
  }
  </script>
  
  <style scoped>
  .navbar {
    padding: 1rem 2rem;
  }
  .btn-primary {
    background-color: #5a7dee;
    border-color: #5a7dee;
  }
  .btn-primary:hover {
    background-color: #4e6dd2;
    border-color: #4e6dd2;
  }
  .logo {
  max-width: 150px;
}
  </style>
  