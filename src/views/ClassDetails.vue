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
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a class="text-decoration-none text-secondary" href='#'>{{ classData.category }}</a>
        </li>
        <li class="breadcrumb-item active" aria-current="page"><a class="text-decoration-none text-dark" href='#'>{{
          classData.subcategory }}</a></li>
      </ol>
    </nav>

    <div class="row">
      <div class="col-md-6 mb-4">
        <div class="class-image-container">
          <img :src="classData.image" :alt="classData.title" class="class-image">
        </div>
      </div>
      <div class="col-md-6">
        <h1 class="h2 mb-3">{{ classData.title }}</h1>
        <div class="d-flex align-items-center mb-2">
          <span class="me-2">{{ classData.ratings_average.toFixed(1) }}</span>
          <StarRating :rating="classData.ratings_average" />
          <span class="text-muted ms-2">({{ classData.reviews.length > 0 ? classData.reviews.length : 0 }} Reviews)</span>
          <span class="ms-3 text-colour">Available: {{ classData.max_capacity - classData.current_enrollment }}/{{
            classData.max_capacity }}</span>
        </div>
        <h2 class="h3 mb-3">${{ classData.price.toFixed(2) }}</h2>
        <p class="mb-4">{{ classData.description }}</p>
        <button @click="handleEnrolClick" class="enrol btn btn-primary btn-lg w-100 text-white align-bottom">Enrol
          Now</button>
      </div>
    </div>

    <div class="card mt-4 p-2 shadow">
      <div class="card-body">
        <h3 class="card-title mb-4">
          Class Details
        </h3>
        <div class="row mt-3">
          <div class="col-md">
            <p class="text-colour"><strong>Class Schedule:</strong></p>
            <p>
              {{ formatDate(classData.start_date) }}
              <br>
              {{ formatTime(classData.start_time) }} - {{ formatTime(classData.end_time) }}
              <br>
              {{ classData.schedule }}
            </p>
          </div>
          <div class="col-md">
            <p class="text-colour"><strong>Number of Lessons:</strong></p>
            <p>{{ classData.number_of_lessons }}</p>
          </div>
          <div class="col-md">
            <p class="text-colour"><strong>Mode of Lessons:</strong></p>
            <p>{{ capitalizeMode(classData.mode) }}</p>
          </div>
          <div class="col-md">
            <p class="text-colour"><strong>Skill Level:</strong></p>
            <p>{{ capitalizeLevel(classData.skill_level) }}</p>
          </div>
          <div class="col-md">
            <p class="text-colour"><strong>Location:</strong></p>
            <p>{{ classData.location }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="card mt-4 p-2 shadow">
      <div class="card-body">
        <h3 class="card-title mb-4">
          Meet the Instructor
        </h3>
        <div class="row mt-3">
          <div class="col-md-4">
            <div class="d-flex flex-column align-items-center">
              <div class="instructor-image-container mb-3">
                <img :src="instructorData.profile_photo" :alt="instructorData.username" class="instructor-image">
              </div>
              <h4 class="h5 mb-1 fw-bold">{{ instructorData.username.toUpperCase() }}</h4>
              <!-- <div class="d-flex align-items-center"> -->
              <!-- <span class="me-2">{{ instructorData.rating }}</span>
                <StarRating :rating="instructorData.rating" />
                <span class="ms-2 text-muted">({{ instructorData.reviews }} Reviews)</span> -->
              <!-- </div> -->
            </div>
          </div>
          <div class="col-md-8">
            <div v-if="classData.reviews.length === 0" class="text-muted d-flex justify-content-center align-items-center"
              style="height: 200px;">
              No reviews yet
            </div>
            <div v-else>
              <div v-for="review in classData.reviews.slice(0, 2)" :key="review.id" class="card mb-3 shadow-sm"
                style="border:1px solid lightgray">
                <div class="card-body">
                  <h5 class="card-title">{{ review.name }}</h5>
                  <div class="d-flex align-items-center mb-2">
                    <StarRating :rating="review.rating" />
                    <small class="text-muted ms-2">{{ formatDate(review.date) }}</small>
                  </div>
                  <p class="card-text">{{ review.comment }}</p>
                </div>
              </div>
              <!-- <a href="#" class="text-decoration-none text-colour">Read all reviews »</a> -->
            </div>
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

    const fetchClassData = async () => {
      try {
        const classId = 'BeISrw3ItXJisW0Lwga1'; // route.params.id; (CHANGE THIS TO route.params.id & change routing)
        const classDoc = await getDoc(doc(db, 'classes', classId));

        if (classDoc.exists()) {
          classData.value = { id: classDoc.id, ...classDoc.data() };
          // Ensure reviews show 0 if the array is empty
          if (!classData.value.reviews || classData.value.reviews.length === 0) {
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
      return new Date(date.seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const formatTime = (time) => {
      return new Date(time.seconds * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const handleEnrolClick = () => {
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

    onMounted(() => {
      fetchClassData();
    });

    return {
      classData,
      instructorData,
      loading,
      error,
      formatDate,
      formatTime,
      handleEnrolClick,
      capitalizeMode,
      capitalizeLevel
    };
  },
  // ADD THIS FPR SEARCH BAR (START)
  created() {
    this.$emit('update:showSearchBar', true);
  },
  beforeUnmount() {
    this.$emit('update:showSearchBar', false);
  }
  // ADD THIS FPR SEARCH BAR (END)
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

.card {
  border: 0;
}
</style>
