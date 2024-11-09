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
                    <span class="me-2">Average Ratings:</span>
                    <StarRating :rating="averageRating" readOnly />
                    <span class="ms-2">({{ averageRating.toFixed(1) }})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <!-- Left Column: Classes Available and Reviews -->
        <div class="col-lg-8 mb-4">
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <ul class="nav nav-tabs" id="profileTabs" role="tablist">
                <li class="nav-item" role="presentation">
                  <button @click="currentTab = 'classes'" :class="{ active: currentTab === 'classes' }" class="nav-link"
                    id="classes-tab" data-bs-toggle="tab" data-bs-target="#classes" type="button" role="tab"
                    aria-controls="classes" aria-selected="true">Classes Available</button>
                </li>
                <li class="nav-item" role="presentation">
                  <button @click="currentTab = 'reviews'" :class="{ active: currentTab === 'reviews' }" class="nav-link"
                    id="reviews-tab" data-bs-toggle="tab" data-bs-target="#reviews" type="button" role="tab"
                    aria-controls="reviews" aria-selected="false">Reviews</button>
                </li>
              </ul>

              <div class="tab-content mt-4" id="profileTabsContent">
                <!-- Classes Available Tab -->
                <div :class="{ 'active show': currentTab === 'classes' }" class="tab-pane fade" id="classes"
                  role="tabpanel" aria-labelledby="classes-tab">
                  <div class="card-body">
                    <h3 class="card-title mb-4">Classes Available</h3>
                    <div v-if="listings.length === 0" class="text-muted text-center">
                      No listings available.
                    </div>
                    <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
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
                            <p class="card-text text-muted small flex-grow-1">
                              {{ truncateText(classItem.description, 100) }}
                            </p>
                            <div class="mt-auto">
                              <div class="d-flex justify-content-between align-items-center mb-3">
                                <p class="card-text h5 text-primary mb-0">${{ classItem.price.toFixed(2) }}</p>
                                <span class="badge bg-light text-dark">
                                  <i class="bi bi-people-fill me-1"></i>
                                  {{ classItem.max_capacity - classItem.current_enrollment }} spots left
                                </span>
                              </div>
                              <!-- <router-link :to="{ name: 'ClassDetails', params: { id: classItem.id } }"
                                class="custom-button w-100">
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



                  <!-- Reviews Tab -->
                  <div :class="{ 'active show': currentTab === 'reviews' }" class="tab-pane fade" id="reviews"
                    role="tabpanel" aria-labelledby="reviews-tab">
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
              </div>
            </div>
          </div>

          <!-- Right Column: Portfolio -->
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
                        <div class="card shadow-sm h-100 portfolio-card">
                          <!-- Carousel for Image/Video Display -->
                          <div :id="'portfolioCarousel' + index" class="carousel slide" data-bs-ride="carousel">
                            <div class="carousel-inner">
                              <div v-if="project.imageUrl" class="carousel-item active">
                                <img :src="project.imageUrl" :alt="project.title"
                                  class="portfolio-image img-fluid h-100 w-100 object-fit-cover">
                              </div>
                              <div v-if="project.youtubeLink" class="carousel-item"
                                :class="{ active: !project.imageUrl }">
                                <div class="ratio ratio-16x9">
                                  <iframe :src="formatYouTubeEmbedUrl(project.youtubeLink)" frameborder="0"
                                    allowfullscreen class="embed-responsive-item"></iframe>
                                </div>
                              </div>
                            </div>
                            <!-- Carousel Controls -->
                            <button v-if="project.imageUrl && project.youtubeLink" class="carousel-control-prev"
                              type="button" :data-bs-target="'#portfolioCarousel' + index" data-bs-slide="prev">
                              <span class="carousel-control-icon" aria-hidden="true"><i
                                  class="bi bi-chevron-left"></i></span>
                              <span class="visually-hidden">Previous</span>
                            </button>
                            <button v-if="project.imageUrl && project.youtubeLink" class="carousel-control-next"
                              type="button" :data-bs-target="'#portfolioCarousel' + index" data-bs-slide="next">
                              <span class="carousel-control-icon" aria-hidden="true"><i
                                  class="bi bi-chevron-right"></i></span>
                              <span class="visually-hidden">Next</span>
                            </button>
                          </div>
                          <!-- Project Details -->
                          <div class="card-body d-flex flex-column">
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
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase_config';
import { useRoute } from 'vue-router';
import StarRating from '../components/StarRating.vue';

const userProfile = ref({});
const reviews = ref([]);
const listings = ref([]);
const portfolio = ref([]);
const averageRating = ref(0);
const loading = ref(true);
const error = ref(null);
const route = useRoute();
const currentTab = ref('classes');

const fetchUserData = async (userID) => {
  if (!userID) {
    error.value = "User ID not found in route parameters.";
    loading.value = false;
    return;
  }
  try {
    const userDoc = await getDoc(doc(db, "users", userID));
    if (userDoc.exists()) {
      const data = userDoc.data();
      console.log("Fetched User Data:", data);  
      userProfile.value = data;
      listings.value = data.posted_classes || [];  
      console.log("Listings Data:", listings.value);  
      portfolio.value = data.portfolio || [];
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
  return `https://www.youtube.com/embed/${videoId}`;
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
  border-top: 5px solid #5a7dee;
  border-radius: 0.375rem;
}

.hover-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
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