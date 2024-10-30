<template>
    <div id="profile-viewing-page" class="container">
      <div class="user-header">
        <h1>{{ user.name }}</h1>
        <p class="subtitle">{{ user.role }}</p>
        <p>{{ user.location }}</p>
        <button class="contact-button">Contact Me</button>
      </div>
  
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
  
      <div class="user-listings">
        <h2>Listings</h2>
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
  
      <div class="analytics-overview">
        <h2>Analytics Overview</h2>
        <div class="analytics-charts">
          <div class="chart new-client-status">
            <!-- Placeholder for pie chart -->
            <h3>New Client Status</h3>
            <div class="chart-placeholder">Chart Placeholder</div>
          </div>
          <div class="chart return-client-status">
            <!-- Placeholder for bar chart -->
            <h3>Return Clients Status</h3>
            <div class="chart-placeholder">Chart Placeholder</div>
          </div>
        </div>
      </div>
  
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
  import { ref, onMounted, computed } from 'vue';
  import { db } from '../firebase/firebase_config'; // Adjust path as necessary
  import { doc, getDoc } from 'firebase/firestore';
  import StarRating from '../components/StarRating.vue'; // Adjust path as necessary
  import { useRoute } from 'vue-router'; // Import useRoute for accessing route parameters
  
  export default {
    name: 'ViewProfile',
    components: {
      StarRating
    },
    setup() {
      const user = ref({});
      const reviews = ref([]);
      const listings = ref([]);
      const portfolio = ref([]);
      const route = useRoute(); // Get the current route
  
      // Fetch user data based on user ID from route parameters
      const fetchUserData = async () => {
        const userId = route.params.userId; // Get user ID from route parameters
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          user.value = { id: userDoc.id, ...userDoc.data() };
          reviews.value = user.value.reviews || [];
          listings.value = user.value.posted_classes || [];
          portfolio.value = user.value.portfolio.project_images || [];
        }
      };
  
      const formatDate = (date) => {
        return new Date(date.seconds * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };
  
      onMounted(() => {
        fetchUserData();
      });
  
      return {
        user,
        reviews,
        listings,
        portfolio,
        formatDate
      };
    }
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }
  
  .user-header {
    margin-bottom: 2rem;
  }
  
  .user-header h1 {
    font-size: 2.5em;
  }
  
  .subtitle {
    font-size: 1.2em;
    color: #777;
  }
  
  .contact-button {
    background-color: #5a7dee;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .contact-button:hover {
    background-color: #4e6dd2;
  }
  
  .user-reviews,
  .user-listings,
  .analytics-overview,
  .user-portfolio {
    margin-bottom: 4rem;
  }
  
  .review-card,
  .listing-card,
  .portfolio-card {
    background: #f9f9f9;
    padding: 1.5rem;
    border-radius: 8px;
    margin: 1rem 0;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
  }
  
  .listing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .analytics-charts {
    display: flex;
    justify-content: space-around;
    margin-top: 2rem;
  }
  
  .chart {
    flex: 1;
    margin: 0 1rem;
  }
  
  .chart-placeholder {
    height: 200px;
    background-color: #eaeaea;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .portfolio-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .portfolio-image {
    width: 100%;
    height: auto;
    border-radius: 8px;
  }
  
  @media (max-width: 768px) {
    .contact-button {
      width: 100%;
    }
  }
  </style>
  