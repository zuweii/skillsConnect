<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Payment for {{ className }}</h1>
    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-else>
      <div class="mb-4">
        <p class="text-xl">Class: {{ className }}</p>
        <p class="text-xl">Price: ${{ classPrice.toFixed(2) }}</p>
      </div>
      <div id="card-element" class="mb-4"></div>
      <button @click="handleSubmit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Pay Now
      </button>
      <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/firebase_config';
import FBInstanceAuth from '../firebase/firebase_auth';

export default {
  name: 'Payment',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const stripe = ref(null);
    const elements = ref(null);
    const cardElement = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const className = ref('');
    const classPrice = ref(0);
    const classId = ref('');

    const fetchClassData = async () => {
      try {
        classId.value = route.params.classId;
        const classDoc = await getDoc(doc(db, 'classes', classId.value));

        if (classDoc.exists()) {
          const classData = classDoc.data();
          className.value = classData.title;
          classPrice.value = classData.price;
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

    const loadStripe = () => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.onload = () => resolve(window.Stripe);
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const initializeStripe = async () => {
      try {
        const StripeInstance = await loadStripe();
        stripe.value = StripeInstance('pk_test_51QCeCgGrm7Jys6wXvdMZgzosRXmSwWseb8MfEFxGyhMB4bfLcNQK1mo7mtqbDhs2anZD2gCjACdmbGI9dtJteyI200oipnoSeV');
        elements.value = stripe.value.elements();
        cardElement.value = elements.value.create('card');
        cardElement.value.mount('#card-element');
      } catch (err) {
        console.error('Error initializing Stripe:', err);
        error.value = 'Error initializing payment system';
      }
    };

    const createPaymentIntent = async (amount) => {
      try {
        console.log('Sending amount to server:', amount);
        const response = await fetch('http://localhost:5175/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Parsed data from server:', data);
        return data;
      } catch (err) {
        console.error('Error creating PaymentIntent:', err);
        throw err;
      }
    };

    const handleSubmit = async () => {
      loading.value = true;
      error.value = null;

      try {
        const user = FBInstanceAuth.getCurrentUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        const { clientSecret } = await createPaymentIntent(classPrice.value);

        const { paymentIntent, error: stripeError } = await stripe.value.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: cardElement.value,
              billing_details: {
                name: user.displayName || user.email,
              },
            },
          }
        );

        if (stripeError) {
          throw new Error(stripeError.message);
        }

        if (paymentIntent.status === 'succeeded') {
          // Update the class enrollment
          const classRef = doc(db, 'classes', classId.value);
          await updateDoc(classRef, {
            current_enrollment: increment(1)
          });

          router.push({ name: 'EnrollmentSuccess', params: { classId: classId.value } });
        }
      } catch (err) {
        console.error('Payment error:', err);
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    onMounted(async () => {
      await fetchClassData();
      await initializeStripe();
    });

    return {
      loading,
      error,
      className,
      classPrice,
      handleSubmit,
    };
  },
};
</script>
