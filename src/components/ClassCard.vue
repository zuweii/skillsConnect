<template>
    <div class="card col-md-8 mx-auto">
      <h3 class="card-header">{{ classData.title }}</h3>
      <img :src="classData.image" :alt="classData.title" class="card-img-top">
      <div class="card-body">
        <p class="card-text">{{ classData.description }}</p>
        <p><strong>Category:</strong> {{ classData.category }} - {{ classData.subcategory }}</p>
        <p><strong>Location:</strong> {{ classData.location }}</p>
        <p><strong>Start Date:</strong> {{ classData.start_date.toDate().toLocaleString() }}</p>
        <div class="class-rating">
          <h5>Class Rating: <StarRating :rating="classData.ratings_average" /></h5>
        </div>
      </div>
  
      <!-- Render Review Class button using the actual class_id from document ID -->
      <div class="card-body" v-if="showReviewButton && classData.class_id">
        <router-link
          :to="{ name: 'ReviewsPage', params: { classId: classData.class_id } }"
          class="btn btn-primary btn-lg w-100 align-bottom mt-2"
        >
          Review Class
        </router-link>
      </div>
    </div>
  </template>
  
  <script>
  import StarRating from './StarRating.vue';
  
  export default {
    props: {
      classData: {
        type: Object,
        required: true,
      },
      showReviewButton: {
        type: Boolean,
        default: false,
      }
    },
    components: {
      StarRating,
    },
    mounted() {
      console.log("Class Data in ClassCard.vue:", this.classData);
    }
  };
  </script>
  