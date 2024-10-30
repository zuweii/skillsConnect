<template>
    <div class="card" style="width: 100%;">
      <h3 class="card-header">{{ classData.title }}</h3>
      <img :src="classData.image" :alt="classData.title" class="card-img-top">
      <div class="card-body">
        <p class="card-text">{{ classData.description }}</p>
        <p class="card-text"><strong>Category:</strong> {{ classData.category }} - {{ classData.subcategory }}</p>
        <p><strong>Location:</strong> {{ classData.location }}</p>
        <p><strong>Start Date:</strong> {{ classData.start_date.toDate().toLocaleString() }}</p>
        <div class="class-rating">
          <h5>Class Rating: <StarRating :rating="classData.ratings_average" /></h5>
        </div>
      </div>
      <div v-if="showReviews" class="card-body">
        <h4>Reviews</h4>
        <div v-if="classData.reviews && classData.reviews.length > 0">
          <div v-for="(review, index) in classData.reviews.slice(0, 2)" :key="index">
            <p><strong>{{ review.name }}:</strong> {{ review.comment }}</p>
            <StarRating :rating="review.rating" />
            <small class="text-muted">{{ formatDate(review.date) }}</small>
          </div>
          <router-link :to="{ name: 'Reviews', params: { classId: classData.id } }" class="btn btn-outline-secondary btn-lg align-bottom mt-2">View All Reviews</router-link>
        </div>
        <div v-else>
          <p>No reviews yet.</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import StarRating from './StarRating.vue';
  
  export default {
    components: {
      StarRating,
    },
    props: {
      classData: {
        type: Object,
        required: true
      },
      showReviews: {
        type: Boolean,
        default: true
      }
    },
    methods: {
      formatDate(date) {
        return new Date(date.seconds * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
    }
  };
  </script>
  