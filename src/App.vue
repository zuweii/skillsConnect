<template>
  <div id="app">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
    <template v-else>
      <LandingNavBar v-if="isLandingPage" />
      <Navbar v-else-if="!isLoginPage && !isSignupPage" :showSearchBar="showSearchBar" />
      <router-view @update:showSearchBar="updateShowSearchBar"></router-view>
      <Footer v-if="shouldShowFooter" />
    </template>
  </div>
</template>

<script>
import Navbar from './components/NavBar.vue';
import LandingNavBar from './components/LandingNavBar.vue';
import Footer from './components/Footer.vue';
import FBInstanceAuth from './firebase/firebase_auth';

export default {
  name: 'App',
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
  computed: {
    isLoginPage() {
      return this.$route.name === 'LoginPage';
    },
    isSignupPage() {
      return this.$route.name === 'SignupPage';
    },
    isLandingPage() {
      return this.$route.name === 'LandingPage';
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
        console.error('Error initializing app:', error);
        this.isLoading = false;
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
