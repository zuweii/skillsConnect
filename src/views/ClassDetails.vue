<template>
  <div v-if="loading" class="container mt-4 text-center">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
  <div v-else-if="error" class="container mt-4">
    <div class="alert alert-danger" role="alert">
      {{ error }}
    </div>
  </div>
  <div v-else class="container mt-4">
    <div class="d-flex align-items-center mb-3">
      <button @click="goBack" class="btn btn-link text-decoration-none text-dark">
        <i class="bi bi-arrow-left fs-5"></i>
      </button>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb mb-0">
          <li class="breadcrumb-item">
            <a class="text-decoration-none text-secondary" href="#">{{ classData.category }}</a>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            <a class="text-decoration-none text-dark" href="#">{{ classData.subcategory }}</a>
          </li>
        </ol>
      </nav>
    </div>

    <div class="row justify-content-center align-items-center">
      <div class="col-md-6 mb-4">
        <div class="class-image-container">
          <img :src="classData.image" :alt="classData.title" class="class-image">
        </div>
      </div>
      <div class="col-md-6">
        <h1 class="h2 mb-3 fw-bold">{{ classData.title }}</h1>
        <div class="d-flex align-items-center mb-2">
          <span class="me-2">{{ classData.ratings_average.toFixed(1) }}</span>
          <StarRating :rating="classData.ratings_average" readOnly />
          <span class="text-muted ms-2">({{ reviewCount }} Reviews)</span>
          <span class="ms-3 badge bg-primary">Available: {{ classData.max_capacity - classData.current_enrollment }}/{{
            classData.max_capacity }}</span>
        </div>
        <h2 class="h3 mb-3 text-colour">${{ classData.price.toFixed(2) }}</h2>
        <p class="mb-4">{{ classData.description }}</p>
        <button @click="handleEnrolClick" class="enrol btn btn-primary btn-lg w-100 text-white align-bottom"
          :disabled="isEnrolled">
          {{ isEnrolled ? 'Already Enrolled' : 'Enrol Now' }}
        </button>
        <p v-if="isEnrolled" class="text-success mt-2 text-center">You have already enrolled in this class!</p>
      </div>
    </div>

    <div class="card mt-4 shadow">
      <div class="card-body">
        <h3 class="card-title fw-bold">Class Details</h3>
        <div class="row mt-4">
          <div class="col-md-4 mb-3">
            <div class="d-flex align-items-center">
              <i class="bi bi-calendar3 text-colour me-2 fs-4"></i>
              <div>
                <p class="mb-0 fw-bold">Start Date</p>
                <p class="mb-0">{{ formatDate(classData.start_date) }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="d-flex align-items-center">
              <i class="bi bi-clock text-colour me-2 fs-4"></i>
              <div>
                <p class="mb-0 fw-bold">Time</p>
                <p class="mb-0">{{ formatTime(classData.start_time) }} - {{ formatTime(classData.end_time) }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="d-flex align-items-center">
              <i class="bi bi-book text-colour me-2 fs-4"></i>
              <div>
                <p class="mb-0 fw-bold">Number of Lessons</p>
                <p class="mb-0">{{ classData.number_of_lessons }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="d-flex align-items-center">
              <i class="bi bi-graph-up text-colour me-2 fs-4"></i>
              <div>
                <p class="mb-0 fw-bold">Skill Level</p>
                <p class="mb-0">{{ capitalizeLevel(classData.skill_level) }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="d-flex align-items-center">
              <i class="bi bi-geo-alt text-colour me-2 fs-4"></i>
              <div>
                <p class="mb-0 fw-bold">Location</p>
                <p class="mb-0">{{ classData.location }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="d-flex align-items-center">
              <i class="bi bi-info-circle text-colour me-2 fs-4"></i>
              <div>
                <p class="mb-0 fw-bold">Additional Details</p>
                <p class="mb-0">{{ classData.schedule || 'No additional details' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card mt-4 p-2 shadow">
      <div class="card-body">
        <h3 class="card-title fw-bold mt-2">
          Meet the Instructor
        </h3>
        <div class="row my-4">
          <div class="col-md-4">
            <div class="d-flex flex-column align-items-center">
              <!-- Router link wrapping the instructor image and name to navigate to ProfileView -->
              <router-link :to="{ name: 'ProfileView', params: { userId: instructorData.id } }"
                class="text-decoration-none">
                <div class="instructor-image-container mb-3">
                  <img :src="instructorData.profile_photo" :alt="instructorData.username" class="instructor-image">
                </div>
                <h4 class="h5 mb-1 text-colour fw-bold">{{ instructorData.username.toUpperCase() }}</h4>
              </router-link>
            </div>
          </div>
          <div class="col-md-8">
            <div v-if="classData.reviews.length === 0" class="text-muted d-flex justify-content-center align-items-center"
              style="height: 200px;">
              No reviews yet
            </div>
            <div v-else>
              <div v-for="review in limitedReviews" :key="review.id" class="card mb-3 shadow-sm"
                style="border:1px solid lightgray">
                <div class="card-body">
                  <div class="d-flex align-items-center mb-2">
                    <img :src="review.userPhoto || '/placeholder.svg?height=40&width=40'" :alt="review.username"
                      class="rounded-circle me-2" style="width: 40px; height: 40px; object-fit: cover;">
                    <div>
                      <h5 class="card-title mb-0">{{ review.username }}</h5>
                      <small class="text-muted">{{ formatDate(review.timestamp) }}</small>
                    </div>
                  </div>
                  <div class="d-flex align-items-center mb-2">
                    <StarRating :rating="review.rating" />
                  </div>
                  <p class="card-text">{{ review.text }}</p>
                </div>
              </div>
              <div v-if="classData.reviews.length > 3" class="text-end mt-3">
                <router-link :to="{ name: 'AllReviews', params: { classId: classData.id } }"
                  class="btn btn-outline-primary">
                  Read All Reviews
                </router-link>
              </div>
            </div>
          </div>
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
import FBInstanceAuth from '../firebase/firebase_auth';

export default {
  name: 'ClassDetails',
  components: {
    StarRating
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const classData = ref(null);
    const instructorData = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const currentUser = ref(null);

    const isEnrolled = computed(() => {
      if (!currentUser.value || !classData.value) return false;
      return currentUser.value.upcoming_classes_as_student.includes(classData.value.id);
    });

    const reviewCount = computed(() => {
      return classData.value && classData.value.reviews ? classData.value.reviews.length : 0;
    });

    const limitedReviews = computed(() => {
      return classData.value && classData.value.reviews ? classData.value.reviews.slice(0, 3) : [];
    });

    const fetchClassData = async () => {
      try {
        const classId = route.params.id;
        const classDoc = await getDoc(doc(db, 'classes', classId));

        if (classDoc.exists()) {
          const data = classDoc.data();
          classData.value = {
            id: classDoc.id,
            ...data,
            average_rating: data.average_rating || 0,
            reviews: data.reviews || []
          };
          await fetchInstructorData(classData.value.teacher_username);
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

    const fetchInstructorData = async (instructorId) => {
      try {
        const instructorDoc = await getDoc(doc(db, 'users', instructorId));
        if (instructorDoc.exists()) {
          instructorData.value = { id: instructorDoc.id, ...instructorDoc.data() };
          console.log('Instructor data:', instructorData.value); // Check if `id` exists
        } else {
          console.error('Instructor not found');
        }
      } catch (err) {
        console.error('Error fetching instructor data:', err);
      }
    };

    const fetchCurrentUserData = async () => {
      const user = FBInstanceAuth.getCurrentUser();
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            currentUser.value = userDoc.data();
          }
        } catch (err) {
          console.error('Error fetching current user data:', err);
        }
      }
    };

    const capitalizeMode = (mode) => {
      if (mode) {
        return mode.charAt(0).toUpperCase() + mode.slice(1).toLowerCase();
      }
      return mode;
    };

    const capitalizeLevel = (level) => {
      if (level) {
        return level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
      }
      return level;
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

    const formatTime = (time) => {
      if (!time || !time.seconds) {
        return 'Time not available';
      }
      return new Date(time.seconds * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const handleEnrolClick = () => {
      if (isEnrolled.value) return;

      const user = FBInstanceAuth.getCurrentUser();
      if (user) {
        router.push({ name: 'Payment', params: { classId: classData.value.id } });
      } else {
        router.push({
          name: 'LoginPage',
          query: { redirect: `/payment/${classData.value.id}` }
        });
      }
    };

    const goBack = () => {
      router.push({ name: 'HomePage' });
    };

    onMounted(() => {
      fetchClassData();
      fetchCurrentUserData();
    });

    return {
      classData,
      instructorData,
      loading,
      error,
      reviewCount,
      limitedReviews,
      formatDate,
      formatTime,
      handleEnrolClick,
      capitalizeMode,
      capitalizeLevel,
      goBack,
      isEnrolled
    };
  },
  created() {
    this.$emit('update:showSearchBar', true);
  },
  beforeUnmount() {
    this.$emit('update:showSearchBar', false);
  }
};
</script>

<style scoped>
.class-image-container {
  width: 100%;
  height: 400px;
  overflow: hidden;
}

.class-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.instructor-image-container {
  width: 150px;
  height: 150px;
  overflow: hidden;
  border-radius: 50%;
}

.instructor-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.text-colour {
  color: #5a7dee;
}

.enrol {
  background-color: #5a7dee;
}

.enrol:hover {
  background-color: #4e6dd2;
}

.enrol:disabled {
  background-color: rgb(192, 192, 192);
  border-color: rgb(192, 192, 192);
  cursor: not-allowed;
}

.card {
  border: 0;
}

.btn-link:hover {
  opacity: 0.7;
}

.bg-primary {
  background-color: #5a7dee !important;
}

.btn-outline-primary {
  color: #5a7dee;
  border-color: #5a7dee;
}

.btn-outline-primary:hover {
  background-color: #5a7dee;
  color: white;
}</style>