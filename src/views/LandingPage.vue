<template>
  <div v-if="loading" class="container mt-4 text-center">
      <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
      </div>
  </div>
  <div v-else-if="error" class="container mt-4">
      <div class="alert alert-danger" role="alert">
          {{ error }}
      </div>
  </div>
  <div v-else class="container-fluid px-4 mt-4">
        <!-- Categories Section -->
        <div class="mb-4">
            <h1 class="h3 mb-4 fw-bold">What would you like to learn?</h1>
            <div class="d-flex flex-wrap gap-2">
                <button
                    class="category-button"
                    @click="clearCategorySelection"
                >
                    All
                </button>
                <button
                    v-for="category in categories"
                    :key="category.category_name"
                    class="category-button"
                    @click="filterClassesByCategory(category.category_name)"
                >
                    {{ category.category_name }}
                </button>
            </div>
        </div>
      
      <!-- Available Classes Section -->
      <h1 class="h3 mb-4 fw-bold">Available Classes</h1>
      <div class="row mb-5">
          <div v-for="classItem in availableClasses" :key="classItem.id" class="col-lg-3 col-md-4 col-sm-6 mb-4">
              <div class="card shadow-sm h-100 hover-card">
                  <div class="card-img-wrapper">
                      <img :src="classItem.image" :alt="classItem.title" class="card-img-top class-image">
                      <div class="card-img-overlay-top">
                          <span class="badge bg-primary">
                              {{ classItem.category }}
                          </span>
                      </div>
                  </div>
                  <div class="card-body d-flex flex-column">
                      <div class="d-flex justify-content-between align-items-start mb-2">
                          <h5 class="card-title fw-bold mb-0">{{ classItem.title }}</h5>
                      </div>
                      <p class="card-text text-muted small flex-grow-1">{{ truncateText(classItem.description, 100) }}
                      </p>
                      <div class="mt-auto">
                          <div class="d-flex justify-content-between align-items-center mb-3">
                              <p class="card-text h5 text-primary mb-0">${{ classItem.price.toFixed(2) }}</p>
                              <span class="badge bg-light text-dark">
                                  <i class="bi bi-people-fill me-1"></i>
                                  {{ classItem.max_capacity - classItem.current_enrollment }} spots left
                              </span>
                          </div>
                          <router-link :to="{ name: 'ClassDetails', params: { id: classItem.id } }"
                              class="custom-button w-100">
                              View Details
                          </router-link>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { collection, getDocs, query, where, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/firebase_config';
import FBInstanceAuth from '../firebase/firebase_auth';

export default {
  name: 'HomePage',
  setup() {
      const classes = ref([]);
      const categories = ref([]);
      const loading = ref(true);
      const error = ref(null);
      const currentUser = ref(null);
      const selectedCategory = ref(null); // To track the selected category

      // Computed property for filtered classes
      const filteredClasses = computed(() => {
          if (!selectedCategory.value) return classes.value; // Return all if no category selected
          return classes.value.filter(classItem => 
              classItem.category === selectedCategory.value
          );
      });
      
      const availableClasses = computed(() => {
          const currentDate = new Date();
          const filteredClasses = selectedCategory.value
              ? classes.value.filter(classItem => classItem.category === selectedCategory.value)
              : classes.value; // Return all if no category selected

          return filteredClasses.filter(classItem => {
              const startDate = classItem.start_date.toDate();
              const hasAvailability = classItem.max_capacity > classItem.current_enrollment;

              return hasAvailability && startDate > currentDate;
          }).sort((a, b) => a.start_date.toDate() - b.start_date.toDate());
      });

      const filterClassesByCategory = (category) => {
          selectedCategory.value = category;
          selectedSubcategory.value = null; // Reset subcategory when a new category is selected
          subcategories.value = category.subcategories || []; // Populate subcategories
      };

      const filterClassesBySubcategory = (subcategory) => {
          selectedSubcategory.value = subcategory;
      };

      const clearCategorySelection = () => {
          selectedCategory.value = null;
          selectedSubcategory.value = null;
          subcategories.value = [];
      };

      const calculateNextLessonDate = (classItem) => {
          const currentDate = new Date();
          const startDate = classItem.start_date.toDate();
          const numberOfLessons = classItem.number_of_lessons;

          for (let i = 0; i < numberOfLessons; i++) {
              const lessonDate = new Date(startDate);
              lessonDate.setDate(lessonDate.getDate() + (i * 7));
              if (lessonDate > currentDate) {
                  return lessonDate;
              }
          }
          return startDate;
      };

      const formatDate = (date) => {
          return date.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
          });
      };

      const formatTime = (timestamp) => {
          return new Date(timestamp.seconds * 1000).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
          });
      };

      const truncateText = (text, length) => {
          if (text.length <= length) return text;
          return text.substring(0, length) + '...';
      };

      const fetchData = async () => {
          try {

              // Fetch all classes
              const classCollection = collection(db, 'classes');
              const classSnapshot = await getDocs(classCollection);
              classes.value = classSnapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data()
              }));

              // Fetch categories
              await fetchCategories();

          } catch (err) {
              console.error('Error fetching data:', err);
              error.value = 'Error loading data';
          } finally {
              loading.value = false;
          }
      };

      const fetchCategories = async () => {
          try {
              const categoryCollection = collection(db, 'categories'); // Ensure the correct path to your categories collection
              const categorySnapshot = await getDocs(categoryCollection);
              categories.value = categorySnapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data()
              }));
          } catch (err) {
              console.error('Error fetching categories:', err);
              error.value = 'Error loading categories';
          }
      };

      onMounted(() => {
          fetchData();
      });

      return {
          availableClasses,
          filteredClasses,
          filterClassesByCategory,
          filterClassesBySubcategory,
          clearCategorySelection,
          categories,
          loading,
          error,
          calculateNextLessonDate,
          formatDate,
          formatTime,
          truncateText
      };
  },
  //SEARCH BAR (START)
  created() {
      this.$emit('update:showSearchBar', true);
  },
  beforeUnmount() {
      this.$emit('update:showSearchBar', false);
  }
  //SEARCH BAR (END)
};
</script>

<style scoped>
.container-fluid {
  max-width: 1400px;
}

.class-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  object-position: center;
}

.card {
  border: 0;
  transition: all 0.3s ease;
}

.gradient-border {
  position: relative;
  background: linear-gradient(white, white) padding-box,
      linear-gradient(45deg, #5a7dee, #4e6dd2) border-box;
  border: 1px solid transparent;
  border-radius: 0.375rem;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(90, 125, 238, 0.15) !important;
}

.card-img-wrapper {
  position: relative;
}

.card-img-overlay-top {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 1;
}

.custom-button {
  display: inline-block;
  padding: 0.5rem 1rem;
  font-weight: 500;
  text-align: center;
  text-decoration: none;
  border-radius: 0.375rem;
  background-color: #5a7dee;
  color: white;
  border: none;
  transition: all 0.2s ease;
}

.custom-button:hover {
  background-color: #4e6dd2;
  color: white;
  transform: translateY(-1px);
}

.btn-outline-primary {
  color: #5a7dee;
  border-color: #5a7dee;
}

.btn-outline-primary:hover {
  background-color: #5a7dee;
  border-color: #5a7dee;
  color: white;
}

.text-primary {
  color: #5a7dee !important;
}

.bg-primary {
  background-color: #5a7dee !important;
}

.upcoming-list {
  max-height: 190px;
  overflow-y: auto;
}

.upcoming-item:last-child {
  border-bottom: none !important;
}

.upcoming-item:hover {
  background-color: #f8f9fa;
}

/* Custom scrollbar */
.upcoming-list::-webkit-scrollbar {
  width: 6px;
}

.upcoming-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.upcoming-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.upcoming-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Loading spinner color */
.spinner-border.text-primary {
  color: #5a7dee !important;
}

.badge {
  font-weight: 500;
}

/* Category Button Styles (new) */
.category-button {
  background: linear-gradient(45deg, #6a89cc, #b8e994);
  color: white;
  padding: 0.5rem 1rem;
  font-weight: 500;
  text-align: center;
  border-radius: 20px;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.category-button:hover {
  background: linear-gradient(45deg, #b8e994, #6a89cc);
  color: white;
  transform: translateY(-2px);
}

.category-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(106, 137, 204, 0.4);
}

/* Optional - Adjust the spacing in the category container */
.category-container {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* Update this if you want specific spacing between category buttons */
.d-flex.gap-2 {
  gap: 12px;
}

</style>