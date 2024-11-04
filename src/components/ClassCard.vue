<template>
  <div class="card mx-auto">
    <h3 class="card-header">{{ classData.title }}</h3>
    <img :src="classData.image" :alt="classData.title" class="card-img-top">
    <div class="card-body">
      <p class="card-text">{{ classData.description }}</p>
      <p><strong>Category:</strong> {{ classData.category }} - {{ classData.subcategory }}</p>
      <p><strong>Location:</strong> {{ classData.location === 'N.A.' ? 'Online' : classData.location }}</p>
      <p><strong>Start Date:</strong> {{ classData.start_date.toDate().toLocaleString() }}</p>
      <div class="class-rating">
        <h5>Class Rating: <StarRating :rating="classData.ratings_average || 0" :readOnly="true" /></h5>
      </div>
    </div>

    <!-- Edit and Review Buttons -->
    <div class="card-footer">
      <router-link
        v-if="showReviewButton && classData.id"
        :to="{ name: 'ReviewsPage', params: { classId: classData.id } }"
        class="btn btn-primary btn-lg w-100 mb-2"
      >
        Review Class
      </router-link>
      <router-link
        v-if="classData.id"
        :to="{ name: 'ListClass', params: { classId: classData.id } }"
        class="btn btn-warning btn-lg w-100"
      >
        Edit Class Listing
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
    console.log("Class Data on mount:", this.classData);
  }
};
</script>


<style scoped>
.card {
  width: 400px; /* Increased width for wider cards */
  margin: 20px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.card-header {
  background-color: #f8f9fa;
  font-weight: bold;
  padding: 15px;
  text-align: center;
  font-size: 1.25rem;
}

.card-img-top {
  width: 100%; /* Ensures image fills the card width */
  height: 250px; /* Adjusted height for larger cards */
  object-fit: cover;
}

.card-body {
  padding: 20px;
  font-size: 1rem;
}

.card-text {
  color: #555;
  margin-bottom: 15px;
  line-height: 1.5;
}

.class-rating {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
}

.btn-primary {
  background-color: #5a7dee;
  border: none;
  transition: background-color 0.3s ease;
}

.btn-primary:hover {
  background-color: #4e6dd2;
}

.btn-lg {
  font-size: 1rem;
  padding: 12px;
}

.card-footer {
  padding: 15px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
}
</style>
