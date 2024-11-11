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

      <div class="scroll-container row mb-5 position-relative">
        <!-- Left Scroll Button -->
        <button @click="scrollLeft" class="scroll-btn scroll-left">
          <i class="bi bi-arrow-left"></i>
        </button>

        <!-- Class Cards -->
        <div ref="cardRow" class="card-row d-flex">
          <div v-for="classItem in availableClasses" :key="classItem.id" class="col-lg-3 col-md-4 col-sm-6 mb-4 p-3">
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
                <h5 class="card-title fw-bold mb-2">{{ classItem.title }}</h5>
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

        <!-- Right Scroll Button -->
        <button @click="scrollRight" class="scroll-btn scroll-right">
          <i class="bi bi-arrow-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase/firebase_config";
import StarRating from "../components/StarRating.vue";

const classes = ref([]);
const categories = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedCategory = ref(null);
const nearbyClasses = ref([]);
const userLocation = ref(null);
const loadingNearby = ref(false);
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const currentUser = ref(null);


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

const topRatedClasses = computed(() => {
  const currentDate = new Date();
  return classes.value
    .filter(classItem => {
      const startDate = classItem.start_date.toDate();
      const endDate = classItem.end_time.toDate();
      return (
        startDate <= currentDate &&
        endDate > currentDate &&
        classItem.max_capacity > classItem.current_enrollment
      );
    })
    .sort((a, b) => b.ratings_average - a.ratings_average)
    .slice(0, 4);
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
    const classQuery = query(classCollection, orderBy("ratings_average", "desc"), limit(50));
    const classSnapshot = await getDocs(classQuery);
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


const getUserLocation = () => {
      return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              userLocation.value = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              resolve(userLocation.value);
            },
            (error) => {
              console.error("Error getting user location:", error);
              reject(error);
            }
          );
        } else {
          reject(new Error("Geolocation is not supported by this browser."));
        }
      });
    };


    const geocodeAddress = async (address) => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address
          )}&key=${GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          return data.results[0].geometry.location;
        }
      } catch (error) {
        console.error("Geocoding error:", error);
      }
      return null;
    };


    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radius of Earth in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

const findNearbyClasses = async () => {
      loadingNearby.value = true;
      try {
        const location = await getUserLocation();
        const currentDate = new Date();
        const classesWithCoordinates = await Promise.all(
          classes.value.map(async (classItem) => {
            if (!classItem.latitude || !classItem.longitude) {
              const coordinates = await geocodeAddress(classItem.location);
              if (coordinates) {
                return {
                  ...classItem,
                  latitude: coordinates.lat,
                  longitude: coordinates.lng,
                };
              }
            }
            return classItem;
          })
        );

        const nearbyClassesAll = classesWithCoordinates.filter((classItem) => {
          if (classItem.latitude && classItem.longitude) {
            const distance = calculateDistance(
              location.latitude,
              location.longitude,
              classItem.latitude,
              classItem.longitude
            );

            // Safely get start and end dates
            const startDate = classItem.start_date?.toDate?.() || new Date(0);
            const startTime = classItem.start_time?.toDate?.() || new Date(0);
            const endDate = classItem.end_date?.toDate?.() || new Date(0);
            const endTime = classItem.end_time?.toDate?.() || new Date(0);

            const classStartDateTime = new Date(
              startDate.getFullYear(),
              startDate.getMonth(),
              startDate.getDate(),
              startTime.getHours(),
              startTime.getMinutes(),
              startTime.getSeconds()
            );
            const classEndDateTime = new Date(
              endDate.getFullYear(),
              endDate.getMonth(),
              endDate.getDate(),
              endTime.getHours(),
              endTime.getMinutes(),
              endTime.getSeconds()
            );

            return (
              distance <= 5 &&
              !currentUser.value?.upcoming_classes_as_teacher?.includes(classItem.id) &&
              classStartDateTime > currentDate &&
              classItem.max_capacity > classItem.current_enrollment

            );
          }
          return false;
        });

        // Sort nearby classes by distance and limit to 4
        nearbyClasses.value = nearbyClassesAll
          .sort((a, b) => {
            const distanceA = calculateDistance(
              location.latitude,
              location.longitude,
              a.latitude,
              a.longitude
            );
            const distanceB = calculateDistance(
              location.latitude,
              location.longitude,
              b.latitude,
              b.longitude
            );
            return distanceA - distanceB;
          })
          .slice(0, 4);
      } catch (error) {
        console.error("Error finding nearby classes:", error);
        nearbyClasses.value = []; // Set to empty array in case of error
      } finally {
        loadingNearby.value = false;
      }
    };

const scrollLeft = () => {
  if (document.querySelector('.card-row')) {
    document.querySelector('.card-row').scrollBy({ left: -800, behavior: 'smooth' });
  }
};

const scrollRight = () => {
  if (document.querySelector('.card-row')) {
    document.querySelector('.card-row').scrollBy({ left: 800, behavior: 'smooth' });
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
}

.categories-btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 5px;
  min-width: min-content;
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
  flex: 0 0 auto;
}

.category-btn:hover {
  background-color: rgba(90, 125, 238, 0.1);
}

.category-btn.active {
  background-color: #5a7dee;
  color: white;
}

.scroll-container {
  overflow-x: hidden;
  position: relative;
}

.card-row {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding-right: 40px;
}

.scroll-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: #ffffff;
  border: none;
  border-radius: 50%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 40px;
  height: 40px;
  cursor: pointer;
  z-index: 10;
}

.scroll-left {
  left: 10px;
}

.scroll-right {
  right: 10px;
}

.scroll-btn i {
  font-size: 1.5rem;
  color: #007bff;
}
</style>