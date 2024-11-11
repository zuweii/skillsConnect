<template>
  <div class="landing-page">
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
      <!-- Nearby Classes Section -->
      <h2 class="h3 mb-4 fw-bold">Nearby Classes</h2>
      <div v-if="loadingNearby" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading nearby classes...</span>
        </div>
      </div>
      <div v-else-if="nearbyClasses.length === 0" class="alert alert-info">
        No classes found within 5km of your location.
      </div>
      <div v-else class="row mb-5">
        <div v-for="classItem in nearbyClasses" :key="classItem.id" class="col-lg-3 col-md-4 col-sm-6 mb-4">
          <div class="card shadow-sm h-100 hover-card">
            <div class="card-img-wrapper">
              <img :src="classItem.image" :alt="classItem.title" class="card-img-top class-image" />
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
              <p class="card-text text-muted small flex-grow-1">
                {{ truncateText(classItem.description, 100) }}
              </p>
              <div class="mt-auto">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <p class="card-text h5 text-primary mb-0">
                    ${{ classItem.price.toFixed(2) }}
                  </p>
                  <span class="badge bg-light text-dark">
                    <i class="bi bi-people-fill me-1"></i>
                    {{ classItem.current_enrollment }} / {{ classItem.max_capacity }} enrolled
                  </span>
                </div>
                <div class="d-flex align-items-center mb-2">
                  <span class="me-2">{{ classItem.ratings_average.toFixed(1) }}</span>
                  <StarRating :rating="classItem.ratings_average" />
                  <span class="text-muted ms-2 fs-6">({{ classItem.reviews.length }})</span>
                </div>
                <router-link :to="{ name: 'ClassDetails', params: { id: classItem.id } }" class="custom-button w-100">
                  View Details
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Available Classes Section -->
      <h2 class="h3 mb-4 fw-bold">Available Classes</h2>

      <!-- Categories Section -->
      <div class="categories-section mb-4">
        <div class="categories-btn-group">
          <button
            class="category-btn"
            :class="{ active: selectedCategory === null }"
            @click="selectCategory(null)"
          >
            All
          </button>
          <button
            v-for="category in categories"
            :key="category.category_name"
            class="category-btn"
            :class="{ active: selectedCategory === category.category_name }"
            @click="selectCategory(category.category_name)"
          >
            {{ category.category_name }}
          </button>
        </div>
      </div>

      <div class="row mb-5">
        <div
          v-for="classItem in availableClasses"
          :key="classItem.id"
          class="col-lg-3 col-md-4 col-sm-6 mb-4"
        >
          <div class="card shadow-sm h-100 hover-card">
            <div class="card-img-wrapper">
              <img
                :src="classItem.image"
                :alt="classItem.title"
                class="card-img-top class-image"
              />
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
              <p class="card-text text-muted small flex-grow-1">
                {{ truncateText(classItem.description, 100) }}
              </p>
              <div class="mt-auto">
                <div
                  class="d-flex justify-content-between align-items-center mb-3"
                >
                  <p class="card-text h5 text-primary mb-0">
                    ${{ classItem.price.toFixed(2) }}
                  </p>
                  <span class="badge bg-light text-dark">
                    <i class="bi bi-people-fill me-1"></i>
                    {{ classItem.current_enrollment }} /
                    {{ classItem.max_capacity }} enrolled
                  </span>
                </div>
                <div class="d-flex align-items-center mb-2">
                  <span class="me-2">{{
                    classItem.ratings_average.toFixed(1)
                  }}</span>
                  <StarRating :rating="classItem.ratings_average" />
                  <span class="text-muted ms-2 fs-6"
                    >({{ classItem.reviews.length }})</span
                  >
                </div>
                <router-link
                  :to="{ name: 'ClassDetails', params: { id: classItem.id } }"
                  class="custom-button w-100"
                >
                  View Details
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase_config";
import StarRating from "../components/StarRating.vue";

const classes = ref([]);
const categories = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedCategory = ref(null);
const nearbyClasses = ref([]);
const loadingNearby = ref(false);

const availableClasses = computed(() => {
  const currentDate = new Date();
  return filteredClasses.value
    .filter((classItem) => {
      const startDate = classItem.start_date.toDate();
      const hasAvailability =
        classItem.max_capacity > classItem.current_enrollment;

      classItem.ratings_average = classItem.ratings_average || 0;
      classItem.reviews = classItem.reviews || [];

      return hasAvailability && startDate > currentDate;
    })
    .sort((a, b) => a.start_date.toDate() - b.start_date.toDate());
});

const filteredClasses = computed(() => {
  let filtered = classes.value;

  if (selectedCategory.value) {
    filtered = filtered.filter(
      (classItem) => classItem.category === selectedCategory.value
    );
  }

  return filtered;
});

const selectCategory = (category) => {
  selectedCategory.value = category;
};

const truncateText = (text, length) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
};

const fetchData = async () => {
  try {
    const classCollection = collection(db, "classes");
    const classSnapshot = await getDocs(classCollection);
    classes.value = classSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    await fetchCategories();
    await findNearbyClasses();
  } catch (err) {
    console.error("Error fetching data:", err);
    error.value = "Error loading data";
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const categoryCollection = collection(db, "categories");
    const categorySnapshot = await getDocs(categoryCollection);
    categories.value = categorySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (err) {
    console.error("Error fetching categories:", err);
    error.value = "Error loading categories";
  }
};

const findNearbyClasses = async () => {
  loadingNearby.value = true;
  try {
    // Simulating nearby classes for the landing page
    nearbyClasses.value = classes.value
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
  } catch (error) {
    console.error("Error finding nearby classes:", error);
  } finally {
    loadingNearby.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.landing-page {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-top: 1rem;
  padding-bottom: 1rem;
}

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
  border-radius: 15px;
  overflow: hidden;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(90, 124, 238, 0.356) !important;
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

.text-primary {
  color: #5a7dee !important;
}

.bg-primary {
  background-color: #5a7dee !important;
}

.spinner-border.text-primary {
  color: #5a7dee !important;
}

.badge {
  font-weight: 500;
}

.categories-section {
  margin-bottom: 2rem;
  overflow-x: auto;
  /* Allow horizontal scrolling on very small screens */
}

.categories-btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 5px;
  min-width: min-content;
  /* Ensure buttons don't shrink below their content width */
}

.category-btn {
  border: none;
  background-color: #ecf3fa;
  color: #333;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 25px;
  font-weight: 500;
  white-space: nowrap;
  /* Prevent text wrapping inside buttons */
  flex: 0 0 auto;
  /* Don't allow buttons to grow or shrink */
}

.category-btn:hover {
  background-color: rgba(90, 125, 238, 0.1);
}

.category-btn.active {
  background-color: #5a7dee;
  color: white;
}

/* Optional - Adjust the spacing in the category container */
.category-container {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>