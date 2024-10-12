<template>
  <div id="app">
    <Navbar v-if="!isLoginPage" />
    <router-view @update:showSearchBar="updateShowSearchBar"></router-view>
    <Footer v-if="!isLoginPage" />
  </div>
</template>

<script>
import Navbar from './components/NavBar.vue'
import Footer from './components/Footer.vue'

export default {
  name: 'App',
  components: {
    Navbar,
    Footer
  },
  data() {
    return {
      showSearchBar: false
    }
  },
  computed: {
    isLoginPage() {
      return this.$route.name === 'LoginPage'
    }
  },
  methods: {
    updateShowSearchBar(value) {
      this.showSearchBar = value
    },
  }
}
</script>

<style>
#app {
  font-family: Arial, sans-serif;
}
</style>