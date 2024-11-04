<template>
  <div id="profile-viewing-page" class="container" v-if="loading">
    Loading profile...
  </div>
  <div id="profile-viewing-page" class="container" v-else-if="error">
    {{ error }}
  </div>
  <div id="profile-viewing-page" class="container" v-else>
    <!-- Profile Header -->
    <div class="profile-header">
      <img :src="userProfile.profile_photo" alt="Profile Picture" class="profile-photo mb-3" />
      <h2>{{ userProfile.username }}</h2>
      <div class="average-rating mt-3">
        <h4>Average Class Rating: <StarRating :rating="averageRating" /></h4>
      </div>
      <button class="contact-button">Contact Me</button>
    </div>

    <!-- User Reviews Section -->
    <div class="user-reviews">
      <h2>User Reviews</h2>
      <div v-if="reviews.length === 0">No reviews yet.</div>
      <div v-else>
        <ul>
          <li v-for="review in reviews" :key="review.id" class="review-card">
            <p><strong>{{ review.author }}</strong></p>
            <p>{{ review.comment }}</p>
            <p><small>Posted on {{ formatDate(review.date) }}</small></p>
            <StarRating :rating="review.rating" />
          </li>
        </ul>
      </div>
    </div>

    <!-- Classes Offered Section -->
    <div class="classes-offered">
      <h2>Classes Available</h2>
      <div v-if="listings.length === 0">No listings available.</div>
      <div class="listing-grid">
        <div v-for="listing in listings" :key="listing.id" class="listing-card">
          <img :src="listing.image" alt="Listing Image" class="listing-image" />
          <h3>{{ listing.title }}</h3>
          <p>Category: {{ listing.category }}</p>
          <p>Price: ${{ listing.price }}</p>
          <button class="enrol-button">Enroll Now</button>
        </div>
      </div>
    </div>

    <!-- Analytics Overview Section -->
    <div class="analytics-overview">
      <h2>Analytics Overview</h2>
      <div class="analytics-charts">
        <div class="chart new-client-status">
          <!-- Placeholder for pie chart -->
          <div class="chart-placeholder">Chart Placeholder</div>
        </div>
        <div class="chart return-client-status">
          <!-- Placeholder for bar chart -->
          <div class="chart-placeholder">Chart Placeholder</div>
        </div>
      </div>
    </div>

    <!-- User Portfolio Section -->
    <div class="user-portfolio">
      <h2>Portfolio</h2>
      <div class="portfolio-grid">
        <div v-for="item in portfolio" :key="item.id" class="portfolio-card">
          <img :src="item.image" alt="Portfolio Item" class="portfolio-image" />
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase_config';
import { useRoute } from 'vue-router';
import StarRating from '../components/StarRating.vue';

export default {
  name: 'ProfileView',
  components: { StarRating },
  setup() {
    const userProfile = ref(null);
    const reviews = ref([]);
    const listings = ref([]);
    const portfolio = ref([]);
    const averageRating = ref(0);
    const loading = ref(true);
    const error = ref(null);
    const route = useRoute();

    const fetchUserData = async (userID) => {
      console.log("Route object:", route); 
      console.log("Route params:", route.params);
      console.log("Fetching user data for userId:", userID); // Debugging
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
          portfolio.value = userProfile.value.portfolio?.project_images || [];

          const totalRatings = listings.value.reduce((sum, cls) => sum + (cls.ratings_average || 0), 0);
          averageRating.value = listings.value.length ? totalRatings / listings.value.length : 0;
        } else {
          error.value = "User profile not found.";
        }
      } catch (err) {
        console.error("Error fetching user data:", err); // Debugging
        error.value = `Error: ${err.message}`;
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      const userId = route.params.userId;
      console.log("Route param userId:", userId); // Debugging
      if (userId) {
        fetchUserData(userId);
      } else {
        error.value = "User ID not found in route parameters.";
        loading.value = false;
      }
    });

    return {
      userProfile,
      reviews,
      listings,
      portfolio,
      averageRating,
      loading,
      error,
    };
  }
};
</script>
  
<style scoped>
.container {
  max-width: 1200px;
  margin-top: 50px;
}

.profile-header {
  margin-bottom: 30px;
  text-align: center;
}

.profile-photo {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h2, h3, h4 {
  font-weight: 600;
  color: #2240a4; /* Primary color used for consistency */
}

.contact-button {
  background-color: #5a7dee;
  color: white;
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  margin-top: 10px;
}

.contact-button:hover {
  background-color: #4e6dd2;
}

.user-reviews, .classes-offered, .analytics-overview, .user-portfolio {
  margin-bottom: 40px;
}

.list-group-item {
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.list-group-item p {
  margin: 0;
}

.listing-grid, .portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.card {
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.card h5 {
  font-size: 1.25rem;
  font-weight: 500;
}

.card p {
  font-size: 0.9rem;
  color: #6c757d;
}

.enrol-button, .contact-button {
  background-color: #5a7dee;
  color: #fff;
  border-radius: 4px;
}

.enrol-button:hover, .contact-button:hover {
  background-color: #4e6dd2;
}

.listing-image, .portfolio-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.analytics-charts {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.chart-placeholder {
  height: 200px;
  background-color: #eaeaea;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #6c757d;
}

.text-center {
  text-align: center;
}

.text-uppercase {
  text-transform: uppercase;
}

.text-muted {
  color: #6c757d !important;
}

.text-primary {
  color: #5a7dee !important;
}

@media (max-width: 768px) {
  .contact-button {
    width: 100%;
  }

  .analytics-charts {
    flex-direction: column;
  }
}
</style>