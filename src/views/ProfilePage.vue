<template>
  <div v-if="loading" class="text-center">Loading profile...</div>
  <div v-else-if="error" class="text-danger text-center">{{ error }}</div>
  <div class="container" v-else>
    <div class="profile-header text-center mb-5">
      <img :src="userProfile.profile_photo || defaultPhoto" alt="Profile Picture" class="profile-photo mb-3" />
      <h2 class="fw-bold">{{ userProfile.username || 'Unknown User' }}</h2>
      <div class="average-rating mt-3">
        <h4>Teacher Average Rating: <StarRating :rating="userProfile.teacher_average || 0" :readOnly="true" /></h4>
      </div>
    </div>

    <!-- Toggle Switch Section -->
    <div class="toggle-switches text-center mb-5">
      <div class="toggle-container">
        <span>View Classes You're Teaching</span>
        <label class="switch">
          <input type="checkbox" v-model="showPastClasses" />
          <span class="slider round"></span>
        </label>
        <span>View Past Classes</span>
      </div>
    </div>

    <!-- Display Classes Section -->
    <div class="classes-offered">
      <h3 class="text-center mb-4" v-if="!showPastClasses">Classes You're Teaching</h3>
      <h3 class="text-center mb-4" v-else>Past Classes</h3>

      <div v-if="!showPastClasses">
        <div v-if="teachingClasses.length > 0" class="class-list">
          <ClassCard v-for="cls in teachingClasses" :key="cls.id" :classData="cls" class="row mb-5" />
        </div>
        <div v-else class="text-muted text-center">You have no classes that you're currently teaching.</div>
      </div>

      <div v-else>
        <div v-if="pastClasses.length > 0" class="class-list">
          <ClassCard
            v-for="pastCls in pastClasses"
            :key="pastCls.class_id"
            :classData="pastCls"
            :showReviewButton="true"
            class="mb-4"
          />
        </div>
        <div v-else class="text-muted text-center">You have no past classes.</div>
      </div>
    </div>
  </div>
</template>

<script>
import ClassCard from '../components/ClassCard.vue';
import StarRating from '../components/StarRating.vue';
import { ref, onMounted } from 'vue';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase_config';
import { getAuth } from 'firebase/auth';

export default {
  components: {
    ClassCard,
    StarRating,
  },
  setup() {
    const auth = getAuth();
    const userProfile = ref({}); // Initialize as an empty object
    const pastClasses = ref([]);
    const teachingClasses = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const averageRating = ref(0);
    const showPastClasses = ref(false);
    const defaultPhoto = ref('../assets/default-profile.png'); // Default image path

    const fetchUserProfile = async (userID) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userID));
        if (userDoc.exists()) {
          userProfile.value = userDoc.data();

          // Retrieve past classes from pending_reviews
          pastClasses.value = (await Promise.all(
            (userProfile.value.pending_reviews || []).map(async (docId) => {
              const classDoc = await getDoc(doc(db, 'classes', docId));
              return classDoc.exists() ? { class_id: classDoc.id, ...classDoc.data() } : null;
            })
          )).filter(cls => cls !== null);

          // Retrieve classes you're teaching from upcoming_classes_as_teacher
          teachingClasses.value = (await Promise.all(
            (userProfile.value.upcoming_classes_as_teacher || []).map(async (classId) => {
              const classDoc = await getDoc(doc(db, 'classes', classId));
              return classDoc.exists() ? { id: classDoc.id, ...classDoc.data() } : null;
            })
          )).filter(cls => cls !== null);

          // Calculate average rating based on teaching classes
          let totalRatings = 0;
          let ratedClassesCount = 0;
          teachingClasses.value.forEach((cls) => {
            if (cls && typeof cls.ratings_average === 'number') {
              totalRatings += cls.ratings_average;
              ratedClassesCount++;
            }
          });
          averageRating.value = ratedClassesCount > 0 ? totalRatings / ratedClassesCount : 0;
        } else {
          error.value = 'User profile not found.';
        }
      } catch (err) {
        error.value = `Error: ${err.message}`;
      } finally {
        loading.value = false;
      }
    };

    const refreshUserProfile = async () => {
      loading.value = true;
      const user = auth.currentUser;
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        error.value = "User not authenticated";
        loading.value = false;
      }
    };

    onMounted(refreshUserProfile);

    return {
      userProfile,
      pastClasses,
      teachingClasses,
      loading,
      error,
      averageRating,
      showPastClasses,
      defaultPhoto,
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  padding-top: 50px;
  margin: 0 auto;
}

.profile-header {
  margin-bottom: 20px;
}

.profile-photo {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ddd;
}

.toggle-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
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

.classes-offered {
  margin-top: 30px;
}

.class-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 768px) {
  .class-list {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 992px) {
  .class-list {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

.text-muted {
  color: #6c757d !important;
}
</style>
