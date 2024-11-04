<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
    <div class="container-fluid">
      <!-- Home Page link -->
      <router-link class="navbar-brand" to="/home-page">
        <img src="../assets/logo.png" class="logo p-2" alt="logo" />
      </router-link>
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
      <div class="collapse navbar-collapse text-dark" id="navbarNav">
        <SearchBar v-if="showSearchBar" class="my-2" />
        <ul class="navbar-nav ms-auto align-items-lg-center">
          <!-- Finances link -->
          <li class="nav-item my-2 my-lg-0">
            <router-link class="nav-link d-flex align-items-center" to="/finances-page">
              <i class="bi bi-currency-dollar me-2"></i> Finances
            </router-link>
          </li>
          <!-- Profile link and dropdown -->
          <li class="nav-item dropdown my-2 my-lg-0">
            <div class="d-flex align-items-center">
              <img
                :src="userProfilePhoto"
                alt="Profile"
                class="profile-photo rounded-circle me-2"
                width="35"
                height="35"
              />
              <router-link class="nav-link me-2" to="/profile-page">Profile</router-link>
              <a
                class="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              ></a>
            </div>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
              <li>
                <button
                  class="dropdown-item text-danger"
                  @click="handleLogout"
                >
                  Logout <i class="bi bi-box-arrow-right text-danger"></i>
                </button>
              </li>
            </ul>
          </li>
          <!-- Teach link -->
          <li class="nav-item my-2 my-lg-0">
            <router-link class="teach btn btn-primary text-white w-100" to="/list-class">Teach</router-link>
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
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase_config';
import FBInstanceAuth from '../firebase/firebase_auth';

export default {
  name: 'Navbar',
  components: {
    SearchBar,
  },
  props: {
    showSearchBar: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      userProfilePhoto: '', // Placeholder for user profile picture URL
    };
  },
  async mounted() {
    const user = FBInstanceAuth.getCurrentUser();
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const currentUser = userDoc.data();
          this.userProfilePhoto = currentUser.profile_photo || 'defaultProfilePhotoURL.jpg';
        }
      } catch (err) {
        console.error('Error fetching current user data:', err);
      }
    }
  },
  methods: {
    async handleLogout() {
      try {
        await signOut(auth);
        localStorage.removeItem('userDocID');
        this.$router.push({ name: 'LoginPage' });
      } catch (error) {
        console.error(error);
      }
    },
  },
};
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

.profile-photo {
  object-fit: cover;
  border: 1px solid #e0e0e0;
}

@media (max-width: 991px) {
  .navbar-nav {
    width: 100%;
  }

  .nav-item {
    width: 100%;
  }

  .dropdown-menu {
    border: none;
    background-color: transparent;
    padding-left: 1rem;
  }

  .profile-photo {
    margin-left: 0.5rem;
  }
}
</style>
