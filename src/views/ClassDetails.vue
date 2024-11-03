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
          <span class="me-2">{{ averageRating.toFixed(1) }}</span>
          <StarRating :rating="averageRating" readOnly />
          <span class="text-muted ms-2">({{ reviewCount }} Reviews)</span>
          <span class="ms-3 text-colour fw-bold">Available: {{ classData.max_capacity - classData.current_enrollment }}/{{ classData.max_capacity }}</span>
        </div>
        <h2 class="h3 mb-3">${{ classData.price.toFixed(2) }}</h2>
        <p class="mb-4">{{ classData.description }}</p>
        <button 
          @click="handleEnrolClick" 
          class="enrol btn btn-primary btn-lg w-100 text-white align-bottom"
          :disabled="isEnrolled"
        >
          {{ isEnrolled ? 'Already Enrolled' : 'Enrol Now' }}
        </button>
        <p v-if="isEnrolled" class="text-success mt-2 text-center">You have already enrolled in this class!</p>
      </div>
    </div>

    <!-- Class Details and Reviews Section -->
    <!-- Instructor details and other parts of your template remain the same -->
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

    const averageRating = computed(() => {
      if (!classData.value || !classData.value.reviews || classData.value.reviews.length === 0) {
        return 0;
      }
      const totalRating = classData.value.reviews.reduce((sum, review) => sum + review.rating, 0);
      return totalRating / classData.value.reviews.length;
    });

    const reviewCount = computed(() => {
      return classData.value && classData.value.reviews ? classData.value.reviews.length : 0;
    });

    const fetchClassData = async () => {
      try {
        const classId = route.params.id;
        const classDoc = await getDoc(doc(db, 'classes', classId));

        if (classDoc.exists()) {
          classData.value = { id: classDoc.id, ...classDoc.data() };
          if (!classData.value.reviews) {
            classData.value.reviews = [];
          }
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
      router.go(-1);
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
      averageRating,
      reviewCount,
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
  color: #2240a4;
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

.font-size {
  font-size: 18px;
}

.row {
  display: flex;
  justify-content: space-around;
  align-items: start;
}

.text-align-top {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.font-size {
  font-size: 18px;
  margin-bottom: 5px;
}

.btn-link:hover {
  opacity: 0.7;
}
</style>

