<template>
    <div v-if="loading">Loading profile...</div>
    <div v-else-if="error">{{ error }}</div>
    <div class="container-fluid" v-else>
      <div class="profile-header text-center">
        <img :src="userProfile.profile_photo" alt="Profile Picture" class="profile-photo mb-3">
        <h2>{{ userProfile.username }}</h2>
        <div class="average-rating mt-3">
          <h4>Average Class Rating: <StarRating :rating="averageRating" /></h4>
        </div>
      </div>
  
      <!-- Toggle Switch Section -->
      <div class="toggle-switches text-center mt-4">
        <div class="toggle-container">
          <span>View Classes You're Teaching</span>
          <label class="switch">
            <input type="checkbox" v-model="showPastClasses">
            <span class="slider round"></span>
          </label>
          <span>View Past Classes</span>
        </div>
      </div>
  
      <!-- Display Classes Section -->
      <div class="classes-offered">
        <h1 style="text-align: center; margin: 10px;" v-if="!showPastClasses">Classes You're Teaching</h1>
        <h1 style="text-align: center; margin: 10px;" v-else>Past Classes</h1>
  
        <!-- Classes You're Teaching Section -->
        <div v-if="!showPastClasses">
          <ClassCard v-for="cls in userClasses" :key="cls.class_id" :classData="cls" />
        </div>
  
        <!-- Past Classes Section -->
        <div v-else>
          <ClassCard v-for="pastCls in pastClasses" :key="pastCls.class_id" :classData="pastCls" :showReviews="false" />
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import ClassCard from '../components/ClassCard.vue';
  import StarRating from '../components/StarRating.vue';
  import { ref, onMounted } from 'vue';
  import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
  import { db } from '../firebase/firebase_config';
  
  export default {
    components: {
      ClassCard,
      StarRating,
    },
    setup() {
      const userClasses = ref([]); 
      const pastClasses = ref([]); 
      const userProfile = ref(null);
      const loading = ref(true);
      const error = ref(null);
      const averageRating = ref(0);
      const showPastClasses = ref(false); 
  
      const fetchUserProfile = async (userID) => {
        try {
          const userDoc = await getDoc(doc(db, 'users', userID));
          if (userDoc.exists()) {
            userProfile.value = userDoc.data();
            pastClasses.value = userProfile.value.pending_reviews || [];
          } else {
            error.value = 'User profile not found.';
          }
        } catch (err) {
          error.value = `Error: ${err.message}`;
        }
      };
  
      const fetchClassesTaught = async (userID) => {
        try {
          const classesQuery = query(collection(db, 'classes'), where('teacher_username', '==', userID));
          const querySnapshot = await getDocs(classesQuery);
  
          const classes = [];
          let totalRatings = 0;
          let ratedClassesCount = 0;
  
          querySnapshot.forEach((doc) => {
            const classData = doc.data();
            classes.push({ id: doc.id, ...classData });
  
            if (classData.ratings_average && classData.ratings_average > 0) {
              totalRatings += classData.ratings_average;
              ratedClassesCount++;
            }
          });
  
          userClasses.value = classes;
          if (ratedClassesCount > 0) {
            averageRating.value = totalRatings / ratedClassesCount;
          } else {
            averageRating.value = 0;
          }
  
          if (classes.length === 0) {
            error.value = 'No classes found.';
          }
        } catch (err) {
          error.value = `Error: ${err.message}`;
        }
      };
  
      onMounted(async () => {
        const userID = 'PSw10xzHopgrEl4vfpDmHJLnGMw2'; 
        await fetchUserProfile(userID); 
        await fetchClassesTaught(userID); 
        loading.value = false;
      });
  
      return {
        userClasses,
        pastClasses,
        userProfile,
        loading,
        error,
        averageRating,
        showPastClasses,
      };
    },
  };
  </script>
  
  <style scoped>
  .container-fluid {
    padding-top: 50px;
  }
  
  .profile-header {
    margin-bottom: 20px;
  }
  
  .profile-photo {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .card {
    border: 0;
    margin-bottom: 20px;
  }
  
  .toggle-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
  }
  
  .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
  }
  
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 34px;
  }
  
  .slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
  
  input:checked + .slider {
    background-color: #4CAF50;
  }
  
  input:checked + .slider:before {
    transform: translateX(26px);
  }
  </style>
  