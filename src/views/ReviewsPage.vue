<template>
    <div v-if="loading">Loading review page...</div>
    <div v-else-if="error">{{ error }}</div>
    <div class="container-fluid" v-else>
      <h1 class="text-center">Review: {{ classData?.title }}</h1>
      <div v-if="classData" class="card col-md-8 mx-auto">
        <img :src="classData.image" :alt="classData.title" class="card-img-top">
        <div class="card-body">
          <p class="card-text">{{ classData.description }}</p>
          <p><strong>Category:</strong> {{ classData.category }} - {{ classData.subcategory }}</p>
          <p><strong>Location:</strong> {{ classData.location }}</p>
          <p><strong>Start Date:</strong> {{ classData.start_date.toDate().toLocaleString() }}</p>
        </div>
  
        <!-- Review Form -->
        <div class="card-body">
          <h5>Leave a Review</h5>
          <div>
            <label>Select a Rating:</label>
            <StarRating :rating="selectedRating" @rating-selected="setRating" />
          </div>
          <textarea v-model="reviewText" class="form-control mt-3" rows="4" placeholder="Write your review here..."></textarea>
          <button @click="submitReview" class="btn btn-primary btn-lg w-100 mt-3">Submit Review</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
  import { db } from '../firebase/firebase_config';
  import StarRating from '../components/StarRating.vue';
  
  export default {
    props: ['classId'],
    components: {
      StarRating,
    },
    setup(props) {
      const router = useRouter(); // Initialize router
      const classData = ref(null);
      const reviewText = ref('');
      const selectedRating = ref(0);
      const loading = ref(true);
      const error = ref(null);
  
      const fetchClassData = async () => {
        try {
          const classDoc = await getDoc(doc(db, 'classes', props.classId));
          if (classDoc.exists()) {
            classData.value = classDoc.data();
          } else {
            error.value = 'Class data not found.';
          }
        } catch (err) {
          error.value = `Error: ${err.message}`;
        } finally {
          loading.value = false;
        }
      };
  
      const setRating = (rating) => {
        selectedRating.value = rating;
      };
  
      const submitReview = async () => {
        if (!reviewText.value || selectedRating.value === 0) {
          alert('Please write a review and select a rating before submitting.');
          return;
        }
        try {
          const review = {
            text: reviewText.value,
            rating: selectedRating.value,
            timestamp: new Date(),
          };
          await updateDoc(doc(db, 'classes', props.classId), {
            reviews: arrayUnion(review),
          });
          alert('Review submitted successfully.');
          reviewText.value = ''; // Clear review after submission
          selectedRating.value = 0; // Reset rating
  
          // Redirect to Profile Page after successful submission
          router.push({ name: 'ProfilePage' });
        } catch (err) {
          error.value = `Error submitting review: ${err.message}`;
        }
      };
  
      onMounted(fetchClassData);
  
      return {
        classData,
        reviewText,
        selectedRating,
        loading,
        error,
        submitReview,
        setRating,
      };
    },
  };
  </script>
  