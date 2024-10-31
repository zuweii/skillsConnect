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
    
    <!-- Upcoming Classes as Student -->
    <h2 class="h3 mb-4">Your Upcoming Classes as a Student</h2>
    <div v-if="upcomingClassesStudent.length" class="row">
      <div v-for="classItem in upcomingClassesStudent" :key="classItem.id" class="col-md-4 mb-4">
        <div class="card shadow-sm">
          <img :src="classItem.image" :alt="classItem.title" class="card-img-top class-image">
          <div class="card-body">
            <h5 class="card-title">{{ classItem.title }}</h5>
            <p class="card-text text-muted">{{ classItem.description }}</p>
            <p class="card-text"><strong>${{ classItem.price.toFixed(2) }}</strong></p>
            <router-link :to="{ name: 'ClassDetails', params: { id: classItem.id }}" class="btn btn-primary w-100">
              View Details
            </router-link>
          </div>
        </div>
      </div>
    </div>
    <p v-else class="text-muted">No upcoming classes as a student.</p>

    <!-- Upcoming Classes as Teacher -->
    <h2 class="h3 mt-5 mb-4">Your Upcoming Classes as a Teacher</h2>
    <div v-if="upcomingClassesTeacher.length" class="row">
      <div v-for="classItem in upcomingClassesTeacher" :key="classItem.id" class="col-md-4 mb-4">
        <div class="card shadow-sm">
          <img :src="classItem.image" :alt="classItem.title" class="card-img-top class-image">
          <div class="card-body">
            <h5 class="card-title">{{ classItem.title }}</h5>
            <p class="card-text text-muted">{{ classItem.description }}</p>
            <p class="card-text"><strong>${{ classItem.price.toFixed(2) }}</strong></p>
            <router-link :to="{ name: 'ClassDetails', params: { id: classItem.id }}" class="btn btn-primary w-100">
              View Details
            </router-link>
          </div>
        </div>
      </div>
    </div>
    <p v-else class="text-muted">No upcoming classes as a teacher.</p>

    <!-- Available Classes -->
    <h2 class="h3 mt-5 mb-4">Available Classes</h2>
    <div class="row">
      <div v-for="classItem in classes" :key="classItem.id" class="col-md-4 mb-4">
        <div class="card shadow-sm">
          <img :src="classItem.image" :alt="classItem.title" class="card-img-top class-image">
          <div class="card-body">
            <h5 class="card-title">{{ classItem.title }}</h5>
            <p class="card-text text-muted">{{ classItem.description }}</p>
            <p class="card-text"><strong>${{ classItem.price.toFixed(2) }}</strong></p>
            <p class="card-text text-muted">
              Available: {{ classItem.max_capacity - classItem.current_enrollment }}/{{ classItem.max_capacity }}
            </p>
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
import { collection, doc, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase_config';
import FBInstanceAuth from '../firebase/firebase_auth';

export default {
  name: 'LandingPage',
  setup() {
    const classes = ref([]);
    const upcomingClassesStudent = ref([]);
    const upcomingClassesTeacher = ref([]);
    const loading = ref(true);
    const error = ref(null);

    const fetchClasses = async () => {
      try {
        // Fetch all available classes
        const classCollection = collection(db, 'classes');
        const classSnapshot = await getDocs(classCollection);
        classes.value = classSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Get current user
        const currentUser = FBInstanceAuth.getCurrentUser();
        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const { upcoming_classes_as_student = [], upcoming_classes_as_teacher = [] } = userDoc.data();

            // Fetch upcoming classes as student
            const studentPromises = upcoming_classes_as_student.map(async id => {
              const classDocRef = doc(db, 'classes', id);
              const classDoc = await getDoc(classDocRef);
              if (classDoc.exists()) {
                return { id: classDoc.id, ...classDoc.data() };
              }
            });

            // Fetch upcoming classes as teacher
            const teacherPromises = upcoming_classes_as_teacher.map(async id => {
              const classDocRef = doc(db, 'classes', id);
              const classDoc = await getDoc(classDocRef);
              if (classDoc.exists()) {
                return { id: classDoc.id, ...classDoc.data() };
              }
            });

            // Store upcoming classes
            upcomingClassesStudent.value = (await Promise.all(studentPromises)).filter(Boolean);
            upcomingClassesTeacher.value = (await Promise.all(teacherPromises)).filter(Boolean);
          }
        }
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
      upcomingClassesStudent,
      upcomingClassesTeacher,
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
