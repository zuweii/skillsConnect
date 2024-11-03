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
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a class="text-decoration-none text-secondary" href='#'>{{ classDetails.category
        }}</a></li>
        <li class="breadcrumb-item active" aria-current="page"><a class="text-decoration-none text-dark" href='#'>{{
          classDetails.subcategory }}</a></li>
      </ol>
    </nav>

    <div class="row">
      <div class="col-md-6 mb-4">
        <div class="class-image-container">
          <img :src="classDetails.image" :alt="classDetails.title" class="class-image">
        </div>
      </div>
      <div class="col-md-6">
        <h1 class="h2 mb-3 fw-bold">Payment for: {{ classDetails.title }}</h1>
        <h2 class="h3 mb-4">${{ classDetails.price.toFixed(2) }}</h2>
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
          <button @click="goToClassDetails" class="btn btn-primary btn-lg w-100 text-white mt-3">View Class
            Details</button>
        </div>
      </div>
    </div>

    <div class="card mt-4 p-2 shadow">
      <div class="card-body">
        <h3 class="card-title mt-2 fw-bold">Class Details</h3>
        <div class="row my-4 text-lg-center">
          <div class="col-lg text-align-top">
            <p class="text-colour font-size fw-bold"><strong>Class Schedule:</strong></p>
            <p>
              {{ formatDate(classDetails.start_date) }}
              <br>
              {{ formatTime(classDetails.start_time) }} - {{ formatTime(classDetails.end_time) }}
              <br>
              <em>{{ classDetails.schedule }}</em>
            </p>
          </div>
          <div class="col-lg text-align-top">
            <p class="text-colour font-size fw-bold"><strong>Number of Lessons:</strong></p>
            <p>{{ classDetails.number_of_lessons }}</p>
          </div>
          <div class="col-lg text-align-top">
            <p class="text-colour font-size fw-bold"><strong>Mode of Lessons:</strong></p>
            <p>{{ capitalizeMode(classDetails.mode) }}</p>
          </div>
          <div class="col-lg text-align-top">
            <p class="text-colour font-size fw-bold"><strong>Skill Level:</strong></p>
            <p>{{ capitalizeLevel(classDetails.skill_level) }}</p>
          </div>
          <div class="col-lg text-align-top">
            <p class="text-colour font-size fw-bold"><strong>Location:</strong></p>
            <p>{{ classDetails.location }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { loadStripe } from '@stripe/stripe-js';
import { doc, getDoc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
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
    const card = ref(null);
    const classDetails = ref(null);
    const processing = ref(false);
    const enrollmentSuccess = ref(false);
    const loading = ref(true);
    const error = ref(null);
    const userDocRef = ref(null);

    const fetchClassDetails = async () => {
      try {
        const classId = route.params.classId;
        const classDoc = await getDoc(doc(db, 'classes', classId));
        if (classDoc.exists()) {
          classDetails.value = { id: classDoc.id, ...classDoc.data() };
          if (!classDetails.value.reviews || classDetails.value.reviews.length === 0) {
            classDetails.value.reviews = [];
          }
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

    onMounted(async () => {
      loading.value = true;
      await FBInstanceAuth.waitForAuthReady(); // Wait for Auth to be fully loaded
      await fetchClassDetails();

      const user = FBInstanceAuth.getCurrentUser();
      if (user) {
        userDocRef.value = doc(db, 'users', user.uid);

        onSnapshot(userDocRef.value, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            console.log('User data updated:', userData);
            if (userData.upcoming_classes_as_student) {
              console.log('Upcoming classes:', userData.upcoming_classes_as_student);
            }
          }
        });
      } else {
        error.value = "User not authenticated. Please log in.";
      }

      stripe.value = await loadStripe('pk_test_51QCeCgGrm7Jys6wXvdMZgzosRXmSwWseb8MfEFxGyhMB4bfLcNQK1mo7mtqbDhs2anZD2gCjACdmbGI9dtJteyI200oipnoSeV');
      const elements = stripe.value.elements();
      card.value = elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#32325d',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a',
          },
        },
        iconStyle: 'solid',
      });
      card.value.mount('#card-element');

      card.value.addEventListener('change', (event) => {
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
        const result = await stripe.value.createToken(card.value);
        if (result.error) {
          const errorElement = document.getElementById('card-errors');
          errorElement.textContent = result.error.message;
        } else {
          console.log('Payment successful:', result.token);

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

    return {
      classDetails,
      submitPayment,
      processing,
      enrollmentSuccess,
      goToClassDetails,
      loading,
      error,
      formatDate,
      formatTime,
      capitalizeMode,
      capitalizeLevel
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

.text-colour {
  color: #2240a4;
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

.font-size {
  font-size: 18px;
  margin-bottom: 5px;
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