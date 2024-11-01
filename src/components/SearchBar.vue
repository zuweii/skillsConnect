<template>
  <div class="search-bar-container">
    <input
      type="text"
      v-model="searchQuery"
      @input="onInput"
      placeholder="What are you looking for?"
      class="search-input"
    />
    <button class="search-button" @click="performSearch">
      <i class="bi bi-search"></i>
    </button>
    <ul v-if="suggestions.length > 0" class="suggestions">
      <li
        v-for="suggestion in suggestions"
        :key="suggestion.id"
        @click="selectSuggestion(suggestion)"
        class="suggestion-item"
      >
        {{ suggestion.title }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
  data() {
    return {
      searchQuery: '',
      suggestions: []
    }
  },
  methods: {
    onInput() {
      // Simulated API call for suggestions
      // Replace this with actual API call when you have the backend ready
      if (this.searchQuery.length > 2) {
        this.suggestions = [
          { id: 1, title: 'Sourdough Bread Baking' },
          { id: 2, title: 'French Pastry Masterclass' },
          { id: 3, title: 'Italian Pasta Making' }
        ].filter(item => item.title.toLowerCase().includes(this.searchQuery.toLowerCase()))
      } else {
        this.suggestions = []
      }
    },
    selectSuggestion(suggestion) {
      this.searchQuery = suggestion.title
      this.suggestions = []
      // Implement navigation to the selected class details page
      // this.$router.push({ name: 'ClassDetails', params: { id: suggestion.id } })
    },
    performSearch() {
      // Implement search functionality
      console.log('Searching for:', this.searchQuery)
    }
  }
}
</script>

<style scoped>
.search-bar-container {
  position: relative;
  width: 100%;
  max-width: 700px;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 15px;
  border: 1px solid #e0e0e0;
  border-radius:20px;
  font-size: 16px;
  background-color: rgb(250, 250, 250);
}

.search-button {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-top: none;
  border-radius: 0 0 20px 20px;
  list-style-type: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}

.suggestion-item {
  padding: 10px 15px;
  cursor: pointer;
}

.suggestion-item:hover {
  background-color: #f5f5f5;
}
</style>