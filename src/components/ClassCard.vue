<template>
  <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
    <div class="card shadow-sm h-100 hover-card">
      <div class="card-img-wrapper">
        <img :src="classData.image" :alt="classData.title" class="card-img-top class-image">
        <div class="card-img-overlay-top">
          <span class="badge bg-primary">{{ classData.category }}</span>
        </div>
      </div>
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <h5 class="card-title fw-bold mb-0">{{ classData.title }}</h5>
        </div>
        <p class="card-text text-muted small flex-grow-1">{{ truncateText(classData.description, 100) }}</p>
        <div class="mt-auto">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <p class="card-text h5 text-primary mb-0">${{ classData.price.toFixed(2) }}</p>
            <span class="badge bg-light text-dark">
              <i class="bi bi-people-fill me-1"></i>
              {{ classData.max_capacity - classData.current_enrollment }} spots left
            </span>
          </div>
          <!-- Edit, Review, and Details Buttons -->
          <router-link
            v-if="showReviewButton && classData.id"
            :to="{ name: 'ReviewsPage', params: { classId: classData.id } }"
            class="btn btn-primary btn-lg w-100 mb-2"
          >
            Review Class
          </router-link>
          <router-link
            v-if="showEditButton && classData.id"
            :to="{ name: 'ListClass', params: { classId: classData.id } }"
            class="btn btn-primary btn-lg w-100 mb-2"
          >
            Edit Class Listing
          </router-link>
          <router-link
            v-if="showDetailsButton && classData.id"
            :to="{ name: 'ClassDetails', params: { id: classData.id } }"
            class="btn btn-primary btn-lg w-100"
          >
            Class Details
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    classData: {
      type: Object,
      required: true,
    },
    showReviewButton: {
      type: Boolean,
      default: false,
    },
    showEditButton: {
      type: Boolean,
      default: false,
    },
    showDetailsButton: {
      type: Boolean,
      default: false,
    }
  },
  methods: {
    truncateText(text, length) {
      return text.length <= length ? text : text.substring(0, length) + '...';
    },
  },
};
</script>

<style scoped>
.class-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  object-position: center;
}

.card {
  border: 0;
  transition: all 0.3s ease;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(90, 125, 238, 0.15) !important;
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

.btn-primary {
  background-color: #5a7dee;
  border: none;
  transition: background-color 0.3s ease;
}

.btn-primary:hover {
  background-color: #4e6dd2;
}

.btn-warning {
  background-color: #ffc107;
  border: none;
  transition: background-color 0.3s ease;
}

.btn-warning:hover {
  background-color: #e0a800;
}

.card-footer {
  padding: 15px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
}
</style>
