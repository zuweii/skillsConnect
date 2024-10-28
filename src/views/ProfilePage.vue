<template>
    <div v-if="loading">Loading classes...</div>
    <div v-else-if="error">{{ error }}</div>
    <div class="container-fluid" v-else>
      <div class="classes-offered">
        <h1 style="text-align: center; margin: 10px;">Classes Offered</h1>
        
        <div v-for="cls in userClasses" :key="cls.class_id" class="col-md-8 mx-auto">
            
             <!-- BS card: Start --> 
             <div class="card" style="width: 100%;"> 
                 <h3 class="card-header">
                        <h3>{{ cls.title }}</h3>
                 </h3>
                 <img :src="cls.image" :alt="cls.title" class="card-img-top" alt="..."> 
                 <div class="card-body"> 
                     <p class="card-text">{{ cls.description }}</p>  
                 </div>
                 <div class="card-body"> 
                    <p class="card-text"><strong>Category:</strong> {{ cls.category }} - {{ cls.subcategory }}</p>
                    <p><strong>Location:</strong> {{ cls.location }}</p>
                    <p><strong>Start Date:</strong> {{ cls.start_date.toDate().toLocaleString() }}</p>  
                 </div>
                 <div class="card-body"> 
                    <button @click="handleEnrolClick(cls.class_id)" class="enrol btn btn-primary btn-lg w-100 text-white align-bottom">Enrol
                        Now</button>
                 </div> 
             </div> 
             <!-- BS card: End --> 
            
          <!-- <h3>{{ cls.title }}</h3>
          <p>{{ cls.description }}</p>
          <p><strong>Category:</strong> {{ cls.category }} - {{ cls.subcategory }}</p>
          <p><strong>Location:</strong> {{ cls.location }}</p>
          <p><strong>Start Date:</strong> {{ cls.start_date.toDate().toLocaleString() }}</p>
          <img :src="cls.image" :alt="cls.title" class="class-image" /> -->
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
      const userClasses = ref([]);
      const loading = ref(true);
      const error = ref(null);
  
      const fetchUserClasses = async () => {
      try {
        // const currentUser = FBInstanceAuth.getCurrentUser(); // Get the current user
        // if (!currentUser) {
        //   throw new Error('User not logged in'); // Handle if no user is logged in
        // }

        // const loggedInUserEmail = currentUser.email; // Retrieve the logged-in user's email
        // const userDocRef = doc(db, 'users', loggedInUserEmail); // Query user document by email
        // const userDoc = await getDoc(userDocRef);

        const userID = 'PSw10xzHopgrEl4vfpDmHJLnGMw2';
        const userDoc = await getDoc(doc(db, 'users', userID));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Retrieve the `posted_classes` array
          userClasses.value = userData.posted_classes || []; // Default to empty array if not found
        } else {
          error.value = 'User not found';
        }
      } catch (err) {
        console.error('Error fetching user classes:', err);
        error.value = err.message;
      } finally {
        loading.value = false;
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

      const handleEnrolClick = (classId) => {
        const user = FBInstanceAuth.getCurrentUser();
        if (user) {
            router.push({ name: 'Payment', params: { classId: classId } });
          } else {
            router.push({
              name: 'LoginPage',
              query: { redirect: `/payment/${classId}` }
            });
          }
        };
      
      onMounted(() => {
        fetchUserClasses();
        });
  
      return {
        userClasses,
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
  