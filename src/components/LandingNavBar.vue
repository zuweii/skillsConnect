<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
    <div class="container-fluid d-flex justify-content-between align-items-center">
      <!-- Logo Link (left-aligned) -->
      <router-link to="/" class="navbar-brand d-flex align-items-center">
        <img src="../assets/logo.png" class="logo p-2" alt="SkillsConnect Logo" />
      </router-link>


      <router-link to="/login" class="btn btn-primary btn-login">Login</router-link>
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
  padding: 0.5rem 1rem;
}

.logo {
  max-width: 140px;
  transition: transform 0.2s ease-in-out;
}

.logo:hover {
  transform: scale(1.01);
}

.btn-login {
  background-color: #5a7dee;
  border-color: #5a7dee;
  white-space: nowrap;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.btn-login:hover {
  background-color: #4e6dd2;
  border-color: #4e6dd2;
}

@media (max-width: 991px) {
  .navbar-nav {
    width: 100%;
    text-align: center;
  }

  .nav-item {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .logo {
    margin-left: 0;
  }
}
</style>