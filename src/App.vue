<template>
  <div id="app">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
    <template v-else>
      <LandingNavBar v-if="isLandingPage" />
      <Navbar v-else-if="!isLoginPage" :showSearchBar="showSearchBar" />
      <router-view @update:showSearchBar="updateShowSearchBar"></router-view>
      <Footer v-if="!isLandingPage && !isLoginPage" />
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
    isLandingPage() {
      return this.$route.name === 'LandingPage';
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
    $route(to, from) {
      this.isLoading = true;
      this.$nextTick(() => {
        this.isLoading = false;
      });
    },
  },
};
</script>


<style>
#app {
  font-family: Arial, sans-serif;
}

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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>