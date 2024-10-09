<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
    <div class="container-fluid">
      <a class="navbar-brand" href="#"><img src="../assets/logo.png" class="logo p-2 mx-5" alt="logo"></a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse text-dark" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item m-2">
            <a class="nav-link" href="#"><i class="bi bi-currency-dollar"></i> Finances</a>
          </li>
          <li class="nav-item m-2">
            <a class="nav-link" href="#"><i class="bi bi-chat"></i> Chats</a>
          </li>
          <li class="nav-item dropdown m-2">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-person"></i> Profile
            </a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
              <li><a class="dropdown-item text-danger" href="#">Logout <i class="bi bi-box-arrow-right text-danger"></i></a></li>
            </ul>
          </li>
          <li class="nav-item m-2">
            <router-link class="teach btn btn-primary text-white" to="/list-class">Teach</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navbar'
}
</script>

<style scoped>
    .logo {
        max-width:150px;
    }
    .teach {
        background-color:#5a7dee;
    }
    .teach:hover {
        background-color: #4e6dd2
    }
</style>