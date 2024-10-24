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
    <h1 class="h2 mb-4">Available Classes</h1>
    <div class="row">
      <div v-for="classItem in classes" :key="classItem.id" class="col-md-4 mb-4">
        <div class="card shadow-sm">
          <img :src="classItem.image" :alt="classItem.title" class="card-img-top class-image">
          <div class="card-body">
            <h5 class="card-title">{{ classItem.title }}</h5>
            <p class="card-text text-muted">{{ classItem.description }}</p>
            <p class="card-text"><strong>${{ classItem.price.toFixed(2) }}</strong></p>
            <p class="card-text text-muted">Available: {{ classItem.max_capacity - classItem.current_enrollment }}/{{
              classItem.max_capacity }}</p>
            <!-- Updated router-link with dynamic classId -->
            <router-link :to="{ name: 'ClassDetails', params: { id: classItem.id }}" class="btn btn-primary w-100">
              View Details
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase_config';

export default {
  name: 'LandingPage',
  setup() {
    const classes = ref([]);
    const loading = ref(true);
    const error = ref(null);

    const fetchClasses = async () => {
      try {
        const classCollection = collection(db, 'classes');
        const classSnapshot = await getDocs(classCollection);
        classes.value = classSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (err) {
        console.error('Error fetching classes:', err);
        error.value = 'Error loading classes';
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchClasses();
    });

    return {
      classes,
      loading,
      error
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
.class-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  object-position: center;
}

.card {
  border: 0;
}
</style>
