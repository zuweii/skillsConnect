<template>
    <div>
      <h1>Reviews for Class {{ classId }}</h1>
      <div v-if="loading">Loading reviews...</div>
      <div v-else-if="error">{{ error }}</div>
      <div v-else>
        <div v-if="reviews.length > 0">
          <div v-for="review in reviews" :key="review.id">
            <p><strong>{{ review.name }}</strong>: {{ review.comment }}</p>
            <StarRating :rating="review.rating" />
            <small class="text-muted">{{ formatDate(review.date) }}</small>
          </div>
        </div>
        <div v-else>
          <p>No reviews found.</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { doc, getDoc } from 'firebase/firestore';
  import { db } from '../firebase/firebase_config';
  import StarRating from '../components/StarRating.vue';
  
  export default {
    props: ['classId'], // Get the classId from the route
    components: {
      StarRating,
    },
    setup(props) {
      const reviews = ref([]);
      const loading = ref(true);
      const error = ref(null);
  
      const fetchClassReviews = async () => {
        try {
          const classDoc = await getDoc(doc(db, 'classes', props.classId));
          if (classDoc.exists()) {
            const classData = classDoc.data();
            reviews.value = classData.reviews || [];
          } else {
            error.value = 'Class not found';
          }
        } catch (err) {
          console.error('Error fetching reviews:', err);
          error.value = `Error: ${err.message}`;
        } finally {
          loading.value = false;
        }
      };
  
      const formatDate = (date) => {
        return new Date(date.seconds * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      };
  
      onMounted(() => {
        fetchClassReviews();
      });
  
      return {
        reviews,
        loading,
        error,
        formatDate,
      };
    },
  };
  </script>
  