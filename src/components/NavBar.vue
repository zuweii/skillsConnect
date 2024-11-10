<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
    <div class="container-fluid d-flex align-items-center">
      <!-- Logo link to the home page -->
      <router-link class="navbar-brand" to="/home-page">
        <img src="../assets/logo.png" class="logo p-2" alt="logo" />
      </router-link>
 
 
      <!-- Centered Search Bar in full size -->
      <div class="flex-grow-1 d-none d-lg-flex justify-content-center">
        <SearchBar
          v-if="showSearchBar"
          :classes="classes"
          @search="handleSearch"
        />
      </div>
 
 
      <!-- Navbar toggler for mobile view -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
 
 
      <!-- Navbar links -->
      <div class="collapse navbar-collapse" id="navbarNav">
        <!-- Search Bar in mobile view (hidden on full size) -->
        <div class="d-lg-none my-2">
          <SearchBar
            v-if="showSearchBar"
            :classes="classes"
            @search="handleSearch"
          />
        </div>
 
 
        <ul class="navbar-nav ms-auto align-items-center">
          <!-- Calendar link -->
          <li class="nav-item my-2 my-lg-0 mx-2">
            <router-link class="nav-link d-flex align-items-center" to="/calendar">
              <i class="bi bi-calendar me-2"></i> Calendar
            </router-link>
          </li>

          <!-- Finances link -->
          <li class="nav-item my-2 my-lg-0 mx-2">
            <router-link
              class="nav-link d-flex align-items-center"
              to="/finances-page"
            >
              <i class="bi bi-currency-dollar me-2"></i> Finances
            </router-link>
          </li>
 
          <div v-if="!isAuthenticated" class="d-flex gap-2">
            <button class="btn-auth" @click="onLogin">Login</button>
            <button class="btn-auth" @click="onSignup">Sign Up</button>
          </div>

          <!-- Show profile icon if user is authenticated -->
          <div v-else>
            <!-- Profile link and dropdown -->
            <li class="nav-item dropdown my-2 my-lg-0 mx-2">
              <a
                class="nav-link d-flex align-items-center dropdown-toggle"
                href="#"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <img
                  :src="userProfilePhoto"
                  alt="Profile"
                  class="profile-photo rounded-circle me-2"
                  width="35"
                  height="35"
                />
                Profile
              </a>
              <ul
                class="dropdown-menu dropdown-menu-end"
                aria-labelledby="navbarDropdown"
              >
                <li>
                  <router-link class="dropdown-item" to="/profile-page"
                    >View Profile</router-link
                  >
                </li>
                <li>
                  <button class="dropdown-item text-danger" @click="handleLogout">
                    Logout <i class="bi bi-box-arrow-right text-danger"></i>
                  </button>
                </li>
              </ul>
            </li>
           </div>

 
          <!-- Teach link with full-width on mobile -->
          <li class="nav-item my-2 my-lg-0 mx-2">
            <router-link
              class="teach btn btn-primary text-white w-100"
              to="/list-class"
              >Teach</router-link
            >
          </li>
        </ul>
      </div>
    </div>
  </nav>
 </template>
 
 
 <script>
 import SearchBar from "./SearchBar.vue";
 import { signOut } from "firebase/auth";
 import { auth } from "../firebase/firebase_config";
 import { doc, getDoc } from "firebase/firestore";
 import { db } from "../firebase/firebase_config";
 import FBInstanceAuth from "../firebase/firebase_auth";
 
 
 export default {
  name: "Navbar",
  components: {
    SearchBar,
  },
  props: {
    showSearchBar: {
      type: Boolean,
      default: false,
    },
    classes: {
      type: Array,
      required: true,
    },
    isAuthenticated: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["search"],
  data() {
    return {
      userProfilePhoto: "", // Placeholder for user profile picture URL
    };
  },
  async mounted() {
    const user = FBInstanceAuth.getCurrentUser();
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const currentUser = userDoc.data();
          this.userProfilePhoto =
            currentUser.profile_photo || "defaultProfilePhotoURL.jpg";
        }
      } catch (err) {
        console.error("Error fetching current user data:", err);
      }
    }
  },
  methods: {
    async handleLogout() {
      try {
        await signOut(auth);
        localStorage.removeItem("userDocID");
        this.$router.push({ name: "LoginPage" });
      } catch (error) {
        console.error(error);
      }
    },
    handleSearch(query) {
      this.$emit("search", query);
    },
    onLogin() {
      this.$emit("login"); // Emit login event for parent component handling
    },
    onSignup() {
      this.$emit("signup"); // Emit signup event for parent component handling
    },
  },
 };
 </script>
 
 
 <style scoped>
 .logo {
  max-width: 140px;
  transition: transform 0.2s ease-in-out;
 }
 
 
 .logo:hover {
  transform: scale(1.01);
 }
 
 
 .nav-link {
  color: #555;
  transition: color 0.2s ease-in-out;
 }
 
 
 .nav-link:hover,
 .dropdown-item:hover {
  color: #5a7dee;
 }
 
 
 .dropdown-item:active,
 .teach:active {
  background-color: #5a7dee;
  color: white;
 }
 
 
 .teach {
  background-color: #5a7dee;
  transition: background-color 0.2s ease-in-out;
 }
 
 
 .teach:hover {
  background-color: #4e6dd2;
 }
 
 
 .profile-photo {
  object-fit: cover;
  border: 1px solid #e0e0e0;
 }
 
 
 .dropdown-menu {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
 
 
  .teach,
  .search {
    width: 100%;
  }
 
 
  .dropdown-menu {
    border: none;
    background-color: transparent;
    padding-left: 1rem;
    box-shadow: none;
  }
 
 
  .profile-photo {
    margin-left: 0.5rem;
  }
 
 
  .logo {
    margin-left: 0;
  }
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
.btn-auth {
  color: #5a7dee;
  background-color: white;
  border: 1px blue;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  transition: background-color 0.3s ease, border-color 0.3s ease;
  white-space: nowrap;
}

.btn-auth:hover {
  background-color: #4e6dd2;
}
 </style>
 