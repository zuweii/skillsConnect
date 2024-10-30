<template>
    <div v-if="loading">Loading profile...</div>
    <div v-else-if="error">{{ error }}</div>
    <div class="container-fluid" v-else>
      <div class="profile-header text-center">
        <!-- Display profile photo -->
        <img :src="userProfile.profile_photo" alt="Profile Picture" class="profile-photo mb-3">
        <h2>{{ userProfile.username }}</h2>
        <div class="average-rating mt-3">
          <h4>Average Class Rating: <StarRating :rating="averageRating"/></h4>
        </div>
      </div>
      <div class="classes-offered">
        <h1 style="text-align: center; margin: 10px;">Classes You're Teaching</h1>
        
        <div v-for="cls in userClasses" :key="cls.class_id" class="col-md-8 mx-auto">
          <!-- BS card: Start --> 
          <div class="card" style="width: 100%;"> 
            <h3 class="card-header">{{ cls.title }}</h3>
            <img :src="cls.image" :alt="cls.title" class="card-img-top">
            <div class="card-body"> 
              <p class="card-text">{{ cls.description }}</p>  
            </div>
            <div class="card-body"> 
              <p class="card-text"><strong>Category:</strong> {{ cls.category }} - {{ cls.subcategory }}</p>
              <p><strong>Location:</strong> {{ cls.location }}</p>
              <p><strong>Start Date:</strong> {{ cls.start_date.toDate().toLocaleString() }}</p>
              <div class="class-rating">
                <h5>Class Rating: <StarRating :rating="cls.ratings_average"/></h5>
              </div>
            </div>
            <!-- Display Reviews -->
            <div class="card-body">
              <h4>Reviews</h4>
              <div v-if="cls.reviews && cls.reviews.length > 0">
                <div v-for="(review, index) in cls.reviews.slice(0, 2)" :key="index">
                  <p><strong>{{ review.name }}:</strong> {{ review.comment }}</p>
                  <StarRating :rating="review.rating" />
                  <small class="text-muted">{{ formatDate(review.date) }}</small>
                </div>
                <router-link :to="{ name: 'Reviews', params: { classId: cls.id } }" class="btn btn-outline-secondary btn-lg align-bottom mt-2">View All Reviews</router-link>
              </div>
              <div v-else>
                <p>No reviews yet.</p>
              </div>
            </div>
          </div> 
          <!-- BS card: End --> 
        </div>
      </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase_config';
import StarRating from '../components/StarRating.vue';

export default {
  components: {
    StarRating,
  },
  setup() {
    const userClasses = ref([]);
    const userProfile = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const averageRating = ref(0);

    const fetchUserProfile = async (userID) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userID));
        if (userDoc.exists()) {
          userProfile.value = userDoc.data();
        } else {
          error.value = 'User profile not found.';
        }
      } catch (err) {
        console.error('Error fetching user profile:', err.message);
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

        if (classes.length === 0) {
          error.value = 'No classes found.';
        } else {
          userClasses.value = classes;
          if (ratedClassesCount > 0) {
            averageRating.value = totalRatings / ratedClassesCount;
          } else {
            averageRating.value = 0;
          }
        }
      } catch (err) {
        console.error('Error fetching classes:', err.message);
        error.value = `Error: ${err.message}`;
      }
    };

    onMounted(async () => {
      const userID = 'PSw10xzHopgrEl4vfpDmHJLnGMw2';
    //   const userID = user.uid; // Use the actual user ID from authentication
    //     await fetchUserProfile(userID);
    //     await fetchClassesTaught(userID);
      await fetchUserProfile(userID);
      await fetchClassesTaught(userID);
      loading.value = false;
    });

    const formatDate = (date) => {
      return new Date(date.seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    return {
      userClasses,
      userProfile,
      loading,
      error,
      averageRating,
      formatDate,
    };
  },
};
</script>

<style scoped>
.profile-header {
  margin-bottom: 20px;
}

.profile-photo {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
}

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

.star-rating {
  display: inline-flex;
  font-size: 1.25rem;
}

.class-rating {
  margin-top: 10px;
}

.text-colour {
  color: #2240a4;
}

.card {
  border: 0;
  margin-bottom: 20px;
}
</style>
