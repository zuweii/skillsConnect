<template>
    <div class="container-fluid px-4 mt-4">
      <div v-if="loading" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>
      <div v-else>
        <div class="d-flex align-items-center mb-4">
          <button @click="goBack" class="btn btn-link text-decoration-none text-dark">
            <i class="bi bi-arrow-left fs-5"></i>
          </button>
          <h1 class="h2 mb-0 ms-2">All Reviews for {{ classData.title }}</h1>
        </div>
        
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <h2 class="h4 mb-0 me-3">{{ classData.ratings_average.toFixed(1) }}</h2>
              <StarRating :rating="classData.ratings_average" readOnly />
              <span class="ms-3 text-muted">({{ classData.reviews.length }} reviews)</span>
            </div>
          </div>
        </div>
  
        <div v-if="classData.reviews.length === 0" class="text-center py-5">
          <p class="text-muted">No reviews yet for this class.</p>
        </div>
        <div v-else>
          <div v-for="review in classData.reviews" :key="review.id" class="card shadow-sm mb-3">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="card-title mb-0">{{ review.username }}</h5>
                <small class="text-muted">{{ formatDate(review.timestamp) }}</small>
              </div>
              <div class="mb-2">
                <StarRating :rating="review.rating" readOnly />
              </div>
              <p class="card-text">{{ review.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
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
              average_rating: data.average_rating || 0,
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
  
      onMounted(() => {
        fetchClassData();
      });
  
      return {
        classData,
        loading,
        error,
        formatDate,
        goBack
      };
    }
  };
  </script>
  
  <style scoped>
  .container-fluid {
    max-width: 1400px;
  }
  
  .card {
    border: 0;
  }
  
  .text-primary {
    color: #5a7dee !important;
  }
  
  .spinner-border.text-primary {
    color: #5a7dee !important;
  }
  </style>