<template>
  <div v-if="loading" class="container mt-4 text-center">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
  <div v-else-if="error" class="container mt-4">
    <div class="alert alert-danger" role="alert">
      {{ error }}
    </div>
  </div>
  <div v-else class="container-fluid px-4 mt-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow">
          <div class="card-header bg-white border-0 py-3">
            <h1 class="h3 mb-0 fw-bold text-center">Review: {{ classData?.title }}</h1>
          </div>
          
          <div class="card-img-wrapper">
            <img :src="classData.image" :alt="classData.title" class="card-img-top class-image">
          </div>
          
          <div class="card-body">
            <div class="mb-4">
              <p class="card-text text-muted">{{ classData.description }}</p>
              <div class="d-flex flex-wrap gap-3">
                <div class="badge bg-primary">
                  <i class="bi bi-bookmark me-1"></i>
                  {{ classData.category }} - {{ classData.subcategory }}
                </div>
                <div class="badge bg-secondary">
                  <i class="bi bi-geo-alt me-1"></i>
                  {{ classData.location === 'N.A.' ? 'Online' : classData.location }}
                </div>
                <div class="badge bg-info">
                  <i class="bi bi-calendar3 me-1"></i>
                  {{ formatDate(classData.start_date) }}
                </div>
              </div>
            </div>

            <div class="review-section p-4 bg-gray-50 rounded-lg">
              <h2 class="h4 mb-4 fw-bold">Share Your Experience</h2>
              
              <div class="mb-4">
                <label class="form-label fw-medium">Your Rating</label>
                <div class="d-flex align-items-center gap-2">
                  <StarRating :rating="selectedRating" @rating-selected="setRating" />
                  <span class="text-muted ms-2">{{ selectedRating }} out of 5</span>
                </div>
              </div>

              <div class="mb-4">
                <label for="reviewText" class="form-label fw-medium">Your Review</label>
                <textarea 
                  v-model="reviewText" 
                  id="reviewText"
                  class="form-control"
                  rows="4"
                  placeholder="Share your thoughts about this class..."
                ></textarea>
              </div>

              <button 
                @click="submitReview" 
                class="custom-button w-100"
                :disabled="!isValidReview"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { doc, getDoc, updateDoc, arrayUnion, runTransaction } from 'firebase/firestore';
import { db } from '../firebase/firebase_config';
import StarRating from '../components/StarRating.vue';
import FBInstanceAuth from '../firebase/firebase_auth';

export default {
  props: ['classId'],
  components: {
    StarRating,
  },
  setup(props) {
    const router = useRouter();
    const classData = ref(null);
    const reviewText = ref('');
    const selectedRating = ref(0);
    const loading = ref(true);
    const error = ref(null);
    const currentUser = ref(null);

    const isValidReview = computed(() => {
      return reviewText.value.trim().length > 0 && selectedRating.value > 0;
    });

    const fetchClassData = async () => {
      try {
        const classDoc = await getDoc(doc(db, 'classes', props.classId));
        if (classDoc.exists()) {
          classData.value = { id: classDoc.id, ...classDoc.data() };
        } else {
          error.value = 'Class not found.';
        }
      } catch (err) {
        error.value = `Error: ${err.message}`;
      } finally {
        loading.value = false;
      }
    };

    const fetchCurrentUser = async () => {
      const user = FBInstanceAuth.getCurrentUser();
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          currentUser.value = { id: user.uid, ...userDoc.data() };
        }
      }
    };

    const setRating = (rating) => {
      selectedRating.value = rating;
    };

    const calculateNewAverage = (currentAverage, currentCount, newRating) => {
      const totalRating = (currentAverage * currentCount) + newRating;
      return totalRating / (currentCount + 1);
    };

    const updateTeacherAverageRating = async (teacherId) => {
      const classesRef = collection(db, 'classes');
      const teacherClassesQuery = query(classesRef, where('teacher_username', '==', teacherId));
      const teacherClassesSnapshot = await getDocs(teacherClassesQuery);

      let totalRating = 0;
      let totalClasses = 0;

      teacherClassesSnapshot.forEach((doc) => {
        const classData = doc.data();
        if (classData.ratings_average) {
          totalRating += classData.ratings_average;
          totalClasses++;
        }
      });

      const newTeacherAverage = totalClasses > 0 ? totalRating / totalClasses : 0;

      const teacherRef = doc(db, 'users', teacherId);
      await updateDoc(teacherRef, {
        teacher_average: newTeacherAverage
      });
    };

    const submitReview = async () => {
    if (!isValidReview.value) {
      alert('Please provide both a rating and review text.');
      return;
    }
  
    try {
      const classRef = doc(db, 'classes', props.classId);
    
      // Check if `teacher_username` exists in `classData` and use it as instructor ID
      const instructorId = classData.value.teacher_username;
      if (!instructorId) {
        throw new Error('Instructor ID is missing from class data.');
      }
    
      const teacherRef = doc(db, 'users', instructorId);
    
      await runTransaction(db, async (transaction) => {
        const classDoc = await transaction.get(classRef);
        if (!classDoc.exists()) {
          throw new Error('Class does not exist!');
        }
      
        const teacherDoc = await transaction.get(teacherRef);
        if (!teacherDoc.exists()) {
          throw new Error('Teacher does not exist!');
        }
      
        const classData = classDoc.data();
        const currentRatingsAverage = classData.ratings_average || 0;
        const currentReviewCount = Array.isArray(classData.reviews) ? classData.reviews.length : 0;
      
        // Calculate the new class average
        const newClassAverage = calculateNewAverage(
          currentRatingsAverage,
          currentReviewCount,
          selectedRating.value
        );
      
        // Create review object
        const review = {
          text: reviewText.value,
          rating: selectedRating.value,
          timestamp: new Date(),
          userId: currentUser.value.id,
          username: currentUser.value.username,
          userPhoto: currentUser.value.profile_photo || null
        };
      
        // Update the class document, ensuring `reviews` exists
        transaction.update(classRef, {
          reviews: arrayUnion(review),
          ratings_average: newClassAverage
        });
      
        // Update the teacher's average rating and review count
        const teacherData = teacherDoc.data();
        const currentTeacherAverage = teacherData.teacher_average || 0;
        const teacherReviewCount = teacherData.total_reviews || 0;
      
        const newTeacherAverage = calculateNewAverage(
          currentTeacherAverage,
          teacherReviewCount,
          selectedRating.value
        );
      
        transaction.update(teacherRef, {
          teacher_average: newTeacherAverage,
          total_reviews: teacherReviewCount + 1
        });
      });
    
      alert('Review submitted successfully!');
      router.push({ name: 'ProfilePage' });
    } catch (err) {
      error.value = `Error submitting review: ${err.message}`;
      alert('Failed to submit review. Please try again.');
    }
  };




    const formatDate = (date) => {
      if (!date || !date.seconds) return 'Date not available';
      return new Date(date.seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    onMounted(async () => {
      await fetchCurrentUser();
      await fetchClassData();
    });

    return {
      classData,
      reviewText,
      selectedRating,
      loading,
      error,
      submitReview,
      setRating,
      formatDate,
      isValidReview
    };
  }
};
</script>

<style scoped>
.container-fluid {
  max-width: 1400px;
}

.class-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  object-position: center;
}

.custom-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  text-align: center;
  text-decoration: none;
  border-radius: 0.375rem;
  background-color: #5a7dee;
  color: white;
  border: none;
  transition: all 0.2s ease;
}

.custom-button:hover:not(:disabled) {
  background-color: #4e6dd2;
  transform: translateY(-1px);
}

.custom-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.badge {
  padding: 0.5em 1em;
  font-weight: 500;
}

.review-section {
  background-color: #f8f9fa;
  border-radius: 0.5rem;
}

.form-label {
  color: #4a5568;
}

.form-control {
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.form-control:focus {
  border-color: #5a7dee;
  box-shadow: 0 0 0 2px rgba(90, 125, 238, 0.2);
}

.text-primary {
  color: #5a7dee !important;
}

.spinner-border.text-primary {
  color: #5a7dee !important;
}
</style>
