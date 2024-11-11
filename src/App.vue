<template>
  <div id="app">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
    <template v-else>
      <LandingNavBar v-if="isLandingPage" @google-login="handleGoogleLogin" />
      <Navbar
        v-else-if="!isLoginPage && !isSignupPage"
        :isAuthenticated="isAuthenticated" 
        @signup="navigateToSignup"
        @login="navigateToLogin" 
        :showSearchBar="showSearchBar"
        :classes="classes"
        @search="handleSearch"
      />
      <router-view
        @update:showSearchBar="updateShowSearchBar"
        :searchQuery="searchQuery"
      ></router-view>
      <!-- <Footer v-if="shouldShowFooter" /> -->
    </template>
  </div>
 </template>
 
 
 <script>
 import { ref, onMounted } from "vue";
 import { useRouter } from "vue-router";
 import { db } from "./firebase/firebase_config";
 import { collection, getDocs } from "firebase/firestore";
 import Navbar from "./components/NavBar.vue";
 import LandingNavBar from "./components/LandingNavBar.vue";
 import Footer from "./components/Footer.vue";
 import { auth, googleProvider } from "./firebase/firebase_config";
 import FBInstanceAuth from "./firebase/firebase_auth";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
 
 
 export default {
  name: "App",
  components: {
    Navbar,
    LandingNavBar,
    Footer,
  },
  data() {
    return {
      showSearchBar: false,
      isLoading: true,
    };
  },
 
 
  setup() {
    const classes = ref([]);
    const router = useRouter();
    const searchQuery = ref("");
    const isAuthenticated = ref(false);
 
    const fetchClasses = async () => {
      try {
        const classCollection = collection(db, "classes");
        const classSnapshot = await getDocs(classCollection);
        classes.value = classSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
 
 
    const handleSearch = (query) => {
      searchQuery.value = query;
    };
     // Define navigateToLogin and navigateToSignup functions
     const navigateToLogin = () => {
      router.push({ name: "LoginPage" });
    };

    const navigateToSignup = () => {
      router.push({ name: "SignupPage" });
    };
 
    onMounted(() => {
      fetchClasses();
      onAuthStateChanged(auth, (user) => {
        isAuthenticated.value = !!user; // Update isAuthenticated based on login state
      });
    });
 
 
    return {
      classes,
      searchQuery,
      handleSearch,
      isAuthenticated, // Return isAuthenticated for Navbar prop binding
      navigateToLogin,
      navigateToSignup,
    };
  },
 
 
  computed: {
    isLoginPage() {
      return this.$route.name === "LoginPage";
    },
    isSignupPage() {
      return this.$route.name === "SignupPage";
    },
    isLandingPage() {
      return this.$route.name === "LandingPage";
    },
    shouldShowFooter() {
      // Show footer on all pages except the landing, login, and signup pages
      return !this.isLoginPage && !this.isSignupPage && !this.isLandingPage;
    },
  },
  methods: {
    updateShowSearchBar(value) {
      this.showSearchBar = value;
    },
    async initializeApp() {
      try {
        await FBInstanceAuth.waitForAuthReady();
        this.isLoading = false;
      } catch (error) {
        console.error("Error initializing app:", error);
        this.isLoading = false;
      }
    },
    async handleGoogleLogin() {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        console.log("User logged in:", user);
        // Perform any additional actions, such as storing user data or redirecting
      } catch (error) {
        console.error("Google login error:", error);
      }
    },
  },
  created() {
    this.initializeApp();
  },
  watch: {
    $route() {
      // Only show the loading overlay if navigating to a new route takes time
      this.isLoading = true;
      this.$nextTick(() => {
        this.isLoading = false;
      });
    },
  },
 };
 </script>
 
 
 <style>
 /* Loading Overlay Styling */
 .loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
 }
 
 
 .loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
 }
 
 
 @keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
 }
 </style>
 