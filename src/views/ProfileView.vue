<template>
  <div class="profile-view">
    <div v-if="loading" class="container-fluid d-flex justify-content-center align-items-center" style="height: 100vh;">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-else-if="error" class="container-fluid mt-4">
      <div class="alert alert-danger" role="alert">
        {{ error }}
      </div>
    </div>
    <div v-else class="container-fluid px-4">
      <!-- Profile Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card shadow-sm gradient-border">
            <div class="card-body d-flex flex-column flex-md-row align-items-center justify-content-between p-4">
              <div class="d-flex flex-column flex-md-row align-items-center mb-3 mb-md-0">
                <img :src="userProfile.profile_photo" :alt="userProfile.username"
                  class="rounded-circle mb-3 mb-md-0 me-md-4" style="width: 150px; height: 150px; object-fit: cover;">
                <div class="text-center text-md-start">
                  <h2 class="card-title mb-2">{{ userProfile.username }}</h2>
                  <div class="d-flex align-items-center justify-content-center justify-content-md-start mb-2">
                    <span class="me-2">Average Class Rating:</span>
                    <StarRating :rating="averageRating" readOnly />
                    <span class="ms-2">({{ averageRating.toFixed(1) }})</span>
                  </div>
                </div>
              </div>
              <!-- <button class="btn btn-primary btn-lg">Contact Me</button> -->
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <!-- Left Column: Reviews and Classes -->
        <div class="col-lg-8 mb-4">
          <!-- User Reviews Section -->
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <h3 class="card-title mb-4">User Reviews</h3>
              <div v-if="reviews.length === 0" class="text-muted text-center">
                No reviews yet.
              </div>
              <div v-else class="row row-cols-1 row-cols-md-2 g-4">
                <div v-for="review in reviews" :key="review.id" class="col">
                  <div class="card h-100 border">
                    <div class="card-body">
                      <h5 class="card-title">{{ review.author }}</h5>
                      <p class="card-text">{{ review.comment }}</p>
                      <div class="d-flex justify-content-between align-items-center">
                        <StarRating :rating="review.rating" readOnly />
                        <small class="text-muted">{{ formatDate(review.date) }}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Classes Offered Section -->
          <div class="card shadow-sm">
            <div class="card-body">
              <h3 class="card-title mb-4">Classes Available</h3>
              <div v-if="listings.length === 0" class="text-muted text-center">
                No listings available.
              </div>
              <div v-else class="row row-cols-1 row-cols-md-2 g-4">
                <div v-for="classItem in listings" :key="classItem.id" class="col">
                  <div class="card h-100 shadow-sm hover-card">
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
                        <!-- <router-link :to="{ name: 'ClassDetails', params: { id: classItem.id } }" class="custom-button w-100">
                          View Details
                        </router-link> -->
                        <router-link class="custom-button w-100">View Details</router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="row">
            <div class="col-12">
              <div class="card shadow-sm mb-4">
                <div class="card-body">
                  <h3 class="card-title mb-4">Portfolio</h3>
                  <div v-if="portfolio.length === 0" class="text-muted text-center">
                    No portfolio projects to display.
                  </div>
                  <div v-else class="portfolio-container">
                    <div v-for="(project, index) in portfolio" :key="index" class="portfolio-item mb-4">
                      <div class="card">
                        <div class="row g-0">
                          <div class="col-md-12">
                            <div class="portfolio-media h-100 position-relative">
                              <img v-if="project.imageUrl" :src="project.imageUrl" alt="Project Image"
                                class="portfolio-image img-fluid h-100 w-100 object-fit-cover">
                              <div v-if="!project.imageUrl && project.youtubeLink" class="ratio ratio-16x9 h-100">
                                <iframe :src="formatYouTubeEmbedUrl(project.youtubeLink)" frameborder="0" allowfullscreen></iframe>
                              </div>
                              <a v-if="project.imageUrl && project.youtubeLink" 
                                 :href="project.youtubeLink" 
                                 target="_blank" 
                                 rel="noopener noreferrer" 
                                 class="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-black bg-opacity-50 text-white text-decoration-none">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-play-circle"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
                              </a>
                            </div>
                          </div>
                          <div class="col-md-12">
                            <div class="card-body">
                              <h5 class="card-title">{{ project.title }}</h5>
                              <p class="card-text">{{ project.description }}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase_config';
import { RouterLink, useRoute } from 'vue-router';
import StarRating from '../components/StarRating.vue';

const userProfile = ref(null);
const reviews = ref([]);
const listings = ref([]);
const portfolio = ref([]);
const averageRating = ref(0);
const loading = ref(true);
const error = ref(null);
const route = useRoute();
const classId = route.params.id;

const fetchUserData = async (userID) => {
  if (!userID) {
    error.value = "User ID not found in route parameters.";
    loading.value = false;
    return;
  }
  try {
    const userDoc = await getDoc(doc(db, "users", userID));
    if (userDoc.exists()) {
      userProfile.value = userDoc.data();
      reviews.value = userProfile.value.reviews || [];
      listings.value = userProfile.value.posted_classes || [];
      portfolio.value = userProfile.value.portfolio || []; 

      const totalRatings = listings.value.reduce((sum, cls) => sum + (cls.ratings_average || 0), 0);
      averageRating.value = listings.value.length ? totalRatings / listings.value.length : 0;
    } else {
      error.value = "User profile not found.";
    }
  } catch (err) {
    console.error("Error fetching user data:", err);
    error.value = `Error: ${err.message}`;
  } finally {
    loading.value = false;
  }
};

const formatDate = (date) => {
  if (!date || !date.seconds) return 'Date not available';
  return new Date(date.seconds * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const truncateText = (text, length) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

const formatYouTubeEmbedUrl = (url) => {
  if (!url) return '';
  const videoId = url.split('v=')[1];
  return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
};

onMounted(() => {
  const userId = route.params.userId;
  if (userId) {
    fetchUserData(userId);
  } else {
    error.value = "User ID not found in route parameters.";
    loading.value = false;
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.profile-view {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.container-fluid {
  max-width: 1400px;
}

.btn-primary {
  background-color: #5a7dee;
  border-color: #5a7dee;
}

.btn-primary:hover, .btn-primary:focus {
  background-color: #4e6dd2;
  border-color: #4e6dd2;
}

.card {
  border: none;
  border-radius: 0.5rem;
  overflow: hidden;
}

.chart-placeholder {
  height: 200px;
  background-color: #e9ecef;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #6c757d;
}

.text-primary {
  color: #5a7dee !important;
}

.class-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  object-position: center;
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

h2, h3, h4, h5 {
  font-weight: 600;
}

.card-title {
  font-size: 1.25rem;
  color: #333;
}

.text-muted {
  color: #6c757d !important;
}
.bg-primary {
    background-color: #5a7dee !important;
}

.portfolio-container {
  max-height: 800px; 
  overflow-y: auto;
  padding-right: 10px;
}

.portfolio-item {
  margin-bottom: 1rem;
}

.portfolio-media {
  height: 200px;
}

.portfolio-image {
  object-fit: cover;
}

.portfolio-video {
  height: 200px;
}

.embed-responsive-item {
  width: 100%;
  height: 100%;
}

.ratio-16x9 {
  aspect-ratio: 16 / 9;
}

.portfolio-media .position-absolute {
  transition: opacity 0.3s ease;
}

.portfolio-media:hover .position-absolute {
  opacity: 0.8;
}

/* Customizing the scrollbar */
.portfolio-container::-webkit-scrollbar {
  width: 8px;
}

.portfolio-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.portfolio-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.portfolio-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

@media (max-width: 767.98px) {
  .card-body {
    padding: 1rem;
  }
}
</style>