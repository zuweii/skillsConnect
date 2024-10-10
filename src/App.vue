<template>
  <div id="app">
    <Navbar :showSearchBar="showSearchBar" />
    <router-view @update:showSearchBar="updateShowSearchBar"></router-view>
    <br>
    <Footer />
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'
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
  methods: {
    updateShowSearchBar(value) {
      this.showSearchBar = value
    }
  }
}
</script>