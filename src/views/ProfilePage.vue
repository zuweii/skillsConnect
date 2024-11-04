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

    <!-- Tabs Section -->
    <div class="tabs text-center mb-5">
      <button @click="showPastClasses = false" :class="{ active: !showPastClasses }" class="tab-button">Classes You're Teaching</button>
      <button @click="showPastClasses = true" :class="{ active: showPastClasses }" class="tab-button">Past Classes</button>
    </div>

    <!-- Display Classes Section -->
    <div class="classes-offered">
      <h3 class="text-center mb-4" v-if="!showPastClasses">Classes You're Teaching</h3>
      <h3 class="text-center mb-4" v-else>Past Classes</h3>

      <div v-if="!showPastClasses">
        <div v-if="teachingClasses.length > 0" class="class-list">
          <ClassCard
            v-for="cls in teachingClasses"
            :key="cls.id"
            :classData="cls"
            :showReviewButton="false"
            :showEditButton="true"
          />
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
            :showEditButton="false"
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
    const userProfile = ref({});
    const pastClasses = ref([]);
    const teachingClasses = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const averageRating = ref(0);
    const showPastClasses = ref(false);
    const defaultPhoto = ref('../assets/default-profile.png');

    const fetchUserProfile = async (userID) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userID));
        if (userDoc.exists()) {
          userProfile.value = userDoc.data();

          pastClasses.value = (await Promise.all(
            (userProfile.value.pending_reviews || []).map(async (docId) => {
              const classDoc = await getDoc(doc(db, 'classes', docId));
              return classDoc.exists() ? { class_id: classDoc.id, ...classDoc.data() } : null;
            })
          )).filter(cls => cls !== null);

          teachingClasses.value = (await Promise.all(
            (userProfile.value.upcoming_classes_as_teacher || []).map(async (classId) => {
              const classDoc = await getDoc(doc(db, 'classes', classId));
              return classDoc.exists() ? { id: classDoc.id, ...classDoc.data() } : null;
            })
          )).filter(cls => cls !== null);

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

.average-rating {
  font-size: 1rem;
  font-weight: 600;
  margin-top: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tabs {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.tab-button {
  background-color: #f0f4ff;
  padding: 10px 20px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  border-radius: 5px;
}

.tab-button.active,
.tab-button:hover {
  background-color: #5a7dee;
  color: white;
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

.card {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-5px);
}

.card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-body {
  padding: 15px;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.card-text {
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 1rem;
}

.badge {
  display: inline-block;
  margin-right: 0.5rem;
  padding: 0.35rem 0.7rem;
  font-size: 0.85rem;
  border-radius: 0.25rem;
}

.text-muted {
  color: #6c757d !important;
}
</style>
