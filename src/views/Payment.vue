<!-- ClassID is passed from Class Details to here!!! -->
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
            <a class="text-decoration-none text-secondary" href="#">{{ classDetails.category }}</a>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            <a class="text-decoration-none text-dark" href="#">{{ classDetails.subcategory }}</a>
          </li>
        </ol>
      </nav>
    </div>

    <div class="row justify-content-center align-items-center">
      <div class="col-md-6 mb-4">
        <div class="class-image-container">
          <img :src="classDetails.image" :alt="classDetails.title" class="class-image">
        </div>
      </div>
      <div class="col-md-6">
        <h1 class="h2 mb-3 fw-bold">Payment for: {{ classDetails.title }}</h1>
        <div class="d-flex align-items-center mb-2">
          <span class="me-2">{{ classDetails.ratings_average.toFixed(1) }}</span>
          <StarRating :rating="classDetails.ratings_average" readOnly />
          <span class="text-muted ms-2">({{ reviewCount }} Reviews)</span>
          <span class="ms-3 badge bg-primary">Available: {{ classDetails.max_capacity - classDetails.current_enrollment }}/{{ classDetails.max_capacity }}</span>
        </div>
        <h2 class="h3 mb-3 text-colour">${{ classDetails.price.toFixed(2) }}</h2>
        <p class="mb-4">{{ classDetails.description }}</p>
        <div v-if="!enrollmentSuccess">
          <div class="card mb-4 p-4 bg-white shadow">
            <h3 class="card-title mb-4">Payment Details</h3>
            <div id="card-element" class="mb-4"></div>
            <div id="card-errors" role="alert" class="text-danger mb-4"></div>
            <button @click="submitPayment" class="btn btn-primary btn-lg w-100 text-white" :disabled="processing">
              {{ processing ? 'Processing...' : 'Pay Now' }}
            </button>
          </div>
        </div>
        <div v-else class="alert alert-success" role="alert">
          <h4 class="alert-heading">Enrollment Successful!</h4>
          <p>You have been successfully enrolled in this class.</p>
          <button @click="goToClassDetails" class="btn btn-primary btn-lg w-100 text-white mt-3">View Class Details</button>
        </div>
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
                <p class="mb-0">{{ formatDate(classDetails.start_date) }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="d-flex align-items-center">
              <i class="bi bi-clock text-colour me-2 fs-4"></i>
              <div>
                <p class="mb-0 fw-bold">Time</p>
                <p class="mb-0">{{ formatTime(classDetails.start_time) }} - {{ formatTime(classDetails.end_time) }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="d-flex align-items-center">
              <i class="bi bi-book text-colour me-2 fs-4"></i>
              <div>
                <p class="mb-0 fw-bold">Number of Lessons</p>
                <p class="mb-0">{{ classDetails.number_of_lessons }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="d-flex align-items-center">
              <i class="bi bi-laptop text-colour me-2 fs-4"></i>
              <div>
                <p class="mb-0 fw-bold">Mode of Lessons</p>
                <p class="mb-0">{{ capitalizeMode(classDetails.mode) }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="d-flex align-items-center">
              <i class="bi bi-graph-up text-colour me-2 fs-4"></i>
              <div>
                <p class="mb-0 fw-bold">Skill Level</p>
                <p class="mb-0">{{ capitalizeLevel(classDetails.skill_level) }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="d-flex align-items-center">
              <i class="bi bi-geo-alt text-colour me-2 fs-4"></i>
              <div>
                <p class="mb-0 fw-bold">Location</p>
                <p class="mb-0">{{ classDetails.location }}</p>
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
              <div class="instructor-image-container mb-3">
                <img :src="instructorData.profile_photo" :alt="instructorData.username" class="instructor-image">
              </div>
              <h4 class="h5 mb-1 text-colour fw-bold">{{ instructorData.username.toUpperCase() }}</h4>
            </div>
          </div>
          <div class="col-md-8">
            <div v-if="classDetails.reviews.length === 0" class="text-muted d-flex justify-content-center align-items-center" style="height: 200px;">
              No reviews yet
            </div>
            <div v-else>
              <div v-for="review in limitedReviews" :key="review.id" class="card mb-3 shadow-sm" style="border:1px solid lightgray">
                <div class="card-body">
                  <div class="d-flex align-items-center mb-2">
                    <img :src="review.userPhoto || '/placeholder.svg?height=40&width=40'" :alt="review.username" class="rounded-circle me-2" style="width: 40px; height: 40px; object-fit: cover;">
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
              <div v-if="classDetails.reviews.length > 3" class="text-end mt-3">
                <router-link :to="{ name: 'AllReviews', params: { classId: classDetails.id } }" class="btn btn-outline-primary">
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
import { loadStripe } from '@stripe/stripe-js';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/firebase_config';
import FBInstanceAuth from '../firebase/firebase_auth';
import StarRating from '../components/StarRating.vue';
import { Timestamp } from 'firebase/firestore';

export default {
  name: 'Payment',
  components: {
    StarRating
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const stripe = ref(null);
    const elements = ref(null);
    const classDetails = ref(null);
    const instructorData = ref(null);
    const processing = ref(false);
    const enrollmentSuccess = ref(false);
    const loading = ref(true);
    const error = ref(null);

    const reviewCount = computed(() => {
      return classDetails.value && classDetails.value.reviews ? classDetails.value.reviews.length : 0;
    });

    const limitedReviews = computed(() => {
      return classDetails.value && classDetails.value.reviews ? classDetails.value.reviews.slice(0, 3) : [];
    });

    const fetchClassDetails = async () => {
      try {
        const classId = route.params.classId;
        const classDoc = await getDoc(doc(db, 'classes', classId));
        if (classDoc.exists()) {
          classDetails.value = { id: classDoc.id, ...classDoc.data() };
          if (!classDetails.value.reviews || classDetails.value.reviews.length === 0) {
            classDetails.value.reviews = [];
          }
          await fetchInstructorData(classDetails.value.teacher_username);
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

    onMounted(async () => {
      loading.value = true;
      await FBInstanceAuth.waitForAuthReady();
      await fetchClassDetails();

      stripe.value = await loadStripe('pk_test_51QCeCgGrm7Jys6wXvdMZgzosRXmSwWseb8MfEFxGyhMB4bfLcNQK1mo7mtqbDhs2anZD2gCjACdmbGI9dtJteyI200oipnoSeV');
      elements.value = stripe.value.elements();
      const cardElement = elements.value.create('card');
      cardElement.mount('#card-element');

      cardElement.on('change', (event) => {
        const displayError = document.getElementById('card-errors');
        if (event.error) {
          displayError.textContent = event.error.message;
        } else {
          displayError.textContent = '';
        }
      });

      loading.value = false;
    });

    const submitPayment = async () => {
      processing.value = true;
      try {
        const { paymentMethod, error } = await stripe.value.createPaymentMethod({
          type: 'card',
          card: elements.value.getElement('card'),
        });

        if (error) {
          const errorElement = document.getElementById('card-errors');
          errorElement.textContent = error.message;
        } else {
          // Here you would typically send the paymentMethod.id to your server
          // to create a charge or save it for later use.
          console.log('Payment Method:', paymentMethod);

          // For this example, we'll simulate a successful payment
          const user = FBInstanceAuth.getCurrentUser();
          if (!user) {
            throw new Error('User not authenticated');
          }

          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            upcoming_classes_as_student: arrayUnion(classDetails.value.id),
          });
          console.log('User document updated with new class ID:', classDetails.value.id);

          const classRef = doc(db, 'classes', classDetails.value.id);
          await updateDoc(classRef, {
            current_enrollment: classDetails.value.current_enrollment + 1
          });
          console.log('Class document updated with new enrollment count');

          const instructorRef = doc(db, 'users', classDetails.value.teacher_username);
          await updateDoc(instructorRef, {
            finances: arrayUnion({
              date: Timestamp.now(),
              amount: classDetails.value.price
            })
          });

          enrollmentSuccess.value = true;
        }
      } catch (error) {
        console.error('Payment error:', error);
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = 'An error occurred while processing your payment. Please try again.';
      } finally {
        processing.value = false;
      }
    };

    const goToClassDetails = () => {
      router.push({ name: 'ClassDetails', params: { id: classDetails.value.id } });
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

    const goBack = () => {
      router.go(-1);
    };

    return {
      classDetails,
      instructorData,
      submitPayment,
      processing,
      enrollmentSuccess,
      goToClassDetails,
      loading,
      error,
      reviewCount,
      limitedReviews,
      formatDate,
      formatTime,
      capitalizeMode,
      capitalizeLevel,
      goBack
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

.btn-primary {
  background-color: #5a7dee;
}

.btn-primary:hover {
  background-color: #4e6dd2;
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
}

.StripeElement {
  background-color: white;
  padding: 10px 12px;
  border-radius: 4px;
  border: 1px solid #ccd0d5;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
  transition: box-shadow .15s ease;
}

.StripeElement--focus {
  box-shadow: 0 1px 3px 0 #cfd7df;
}

.StripeElement--invalid {
  border-color: #fa755a;
}

.StripeElement--webkit-autofill {
  background-color: #fefde5 !important;
}
</style>