<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
    <div class="container-fluid">
      <a class="navbar-brand" href="#"><img src="../assets/logo.png" class="logo p-2 mx-5" alt="logo"></a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse text-dark" id="navbarNav">
        <SearchBar v-if="showSearchBar" class="me-auto" />
        <ul class="navbar-nav ms-auto">
          <li class="nav-item m-2">
            <a class="nav-link" href="#"><i class="bi bi-currency-dollar"></i> Finances</a>
          </li>
          <li class="nav-item m-2">
            <!-- Use router-link for Chats button to navigate to the chat page -->
            <router-link class="nav-link" to="/chat"><i class="bi bi-chat"></i> Chats</router-link>
          </li>
          <li class="nav-item dropdown m-2">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" data-bs-toggle="dropdown"
              aria-expanded="false">
              <i class="bi bi-person"></i> Profile
            </a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
              <li><button class="dropdown-item text-danger" @click="handleLogout">Logout <i
                    class="bi bi-box-arrow-right text-danger"></i></button></li>
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
import SearchBar from './SearchBar.vue';
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase_config";


export default {
  name: 'Navbar',
  components: {
    SearchBar
  },
  props: {
    showSearchBar: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    async handleLogout() {
      try {
        await signOut(auth);
        console.log("User signed out successfully");

        // Clear the userDocID from local storage
        localStorage.removeItem('userDocID'); 
        console.log(localStorage.getItem('userDocID'));

        // Redirect to the login page after logout
        this.$router.push({ name: 'LoginPage' });
      } catch (error) {
        console.error(error);
      }
    }
  }
}
</script>

<style scoped>
.logo {
  max-width: 150px;
}

.teach {
  background-color: #5a7dee;
}

.teach:hover {
  background-color: #4e6dd2;
}
</style>
