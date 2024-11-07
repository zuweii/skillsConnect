<template>
  <div class="reviews-page">
    <div v-if="loading" class="loading-spinner">
      <div class="spinner"></div>
    </div>
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>
    <div v-else class="reviews-content">
      <div class="reviews-header">
        <button @click="goBack" class="back-button">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h1 class="reviews-title">Reviews for {{ classData.title }}</h1>
      </div>
      
      <div class="reviews-summary">
        <div class="rating-box">
          <h2 class="rating-average">{{ classData.ratings_average.toFixed(1) }}</h2>
          <StarRating :rating="classData.ratings_average" readOnly />
          <span class="rating-count">{{ classData.reviews.length }} reviews</span>
        </div>
        <div class="rating-bars">
          <div v-for="i in 5" :key="i" class="rating-bar">
            <span class="rating-label">{{ 6 - i }} stars</span>
            <div class="progress">
              <div class="progress-bar" :style="{ width: `${getRatingPercentage(6 - i)}%` }"></div>
            </div>
            <span class="rating-count">{{ getRatingCount(6 - i) }}</span>
          </div>
        </div>
      </div>

      <div v-if="classData.reviews.length === 0" class="no-reviews">
        <i class="bi bi-chat-square-text"></i>
        <p>No reviews yet for this class.</p>
      </div>
      <div v-else class="reviews-list">
        <div v-for="review in classData.reviews" :key="review.id" class="review-card">
          <div class="review-header">
            <div class="reviewer-info">
              <img :src="review.userPhoto || '/placeholder.svg?height=60&width=60'" :alt="review.username" class="reviewer-avatar">
              <div class="reviewer-details">
                <h3 class="reviewer-name">{{ review.username }}</h3>
                <StarRating :rating="review.rating" readOnly />
              </div>
            </div>
            <span class="review-date">{{ formatDate(review.timestamp) }}</span>
          </div>
          <p class="review-text">{{ review.text }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase_config';
import StarRating from '../components/StarRating.vue';

export default {
  name: 'AllReviews',
  components: {
    StarRating
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const classData = ref(null);
    const loading = ref(true);
    const error = ref(null);

    const fetchClassData = async () => {
      try {
        const classId = route.params.classId;
        const classDoc = await getDoc(doc(db, 'classes', classId));

        if (classDoc.exists()) {
          const data = classDoc.data();
          classData.value = { 
            id: classDoc.id, 
            ...data,
            ratings_average: data.ratings_average || 0,
            reviews: data.reviews || []
          };
        } else {
          error.value = 'Class not found';
        }
      } catch (err) {
        console.error('Error fetching class data:', err);
        error.value = 'Error loading class data';
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (date) => {
      if (!date || !date.seconds) {
        return 'Date not available';
      }
      return new Date(date.seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const goBack = () => {
      router.go(-1);
    };

    const getRatingCount = (rating) => {
      return classData.value.reviews.filter(review => review.rating === rating).length;
    };

    const getRatingPercentage = (rating) => {
      const count = getRatingCount(rating);
      return (count / classData.value.reviews.length) * 100 || 0;
    };

    onMounted(() => {
      fetchClassData();
    });

    return {
      classData,
      loading,
      error,
      formatDate,
      goBack,
      getRatingCount,
      getRatingPercentage
    };
  }
};
</script>

<style scoped>
.reviews-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.reviews-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #5a7dee;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  margin-top: 2rem;
}

.reviews-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}

.back-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #5a7dee;
  cursor: pointer;
  padding: 0.5rem;
  margin-right: 1rem;
  transition: transform 0.2s ease-in-out;
}

.back-button:hover {
  transform: translateX(-3px);
}

.reviews-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.reviews-summary {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rating-box {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.rating-average {
  font-size: 4rem;
  font-weight: 700;
  color: #5a7dee;
  margin: 0 0 0.5rem 0;
}

.rating-count {
  font-size: 1rem;
  color: #6c757d;
  margin-top: 0.5rem;
}

.rating-bars {
  flex-grow: 1;
  margin-left: 2rem;
}

.rating-bar {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.rating-label {
  width: 60px;
  text-align: right;
  margin-right: 1rem;
  font-size: 0.9rem;
  color: #6c757d;
}

.progress {
  flex-grow: 1;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #5a7dee;
  transition: width 0.3s ease-in-out;
}

.rating-bar .rating-count {
  width: 40px;
  text-align: right;
  margin-left: 1rem;
  font-size: 0.9rem;
  color: #6c757d;
}

.no-reviews {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 4rem 2rem;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.no-reviews i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #5a7dee;
}

.reviews-list {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.review-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.review-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.reviewer-info {
  display: flex;
  align-items: center;
}

.reviewer-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 1rem;
  object-fit: cover;
}

.reviewer-details {
  display: flex;
  flex-direction: column;
}

.reviewer-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.25rem 0;
}

.review-date {
  font-size: 0.7rem;
  color: #6c757d;
}

.review-text {
  font-size: 1rem;
  color: #4a4a4a;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 768px) {
  .reviews-content {
    padding: 1rem;
  }

  .reviews-title {
    font-size: 2rem;
  }

  .reviews-summary {
    flex-direction: column;
    align-items: flex-start;
  }

  .rating-box {
    margin-bottom: 1.5rem;
  }

  .rating-bars {
    margin-left: 0;
    width: 100%;
  }

  .reviews-list {
    grid-template-columns: 1fr;
  }
}
</style>