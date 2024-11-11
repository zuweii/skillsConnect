<template>
  <div class="reviews-page">
    <div v-if="loading" class="container-fluid d-flex justify-content-center align-items-center" style="height: 100vh;">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-else-if="error" class="container-fluid mt-4">
      <div class="alert alert-danger" role="alert">
        {{ error }}
      </div>
    </div>
    <div v-else class="container-fluid px-4 py-5">
      <div class="mb-4">
        <a @click="goBack" class="back-link">
          <i class="bi bi-arrow-left me-2"></i>Back to previous page
        </a>
      </div>
      <div class="row g-4">
        <div class="col-lg-8">
          <div class="card shadow-lg rounded-lg overflow-hidden">
            <div class="card-header custom-bg text-white py-3">
              <h1 class="h3 mb-0  text-center">Review: {{ classData?.title }}</h1>
            </div>
            
            <div class="card-img-wrapper position-relative">
              <img :src="classData.image" :alt="classData.title" class="card-img-top class-image">
              <div class="overlay-gradient"></div>
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

              <div class="review-section p-4 bg-light rounded-lg shadow-sm">
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
        <div class="col-lg-4">
          <div class="card shadow-lg rounded-lg overflow-hidden">
            <div class="card-header bg-secondary text-white py-3">
              <h3 class="text-center h5 mb-0">Class Details</h3>
            </div>
            <div class="card-body">
              <ul class="list-unstyled">
                <li class="mb-3 d-flex align-items-center">
                  <i class="bi bi-person-circle me-3 fs-4 text-primary"></i>
                  <div>
                    <strong>Instructor:</strong><br>
                    {{ teacherUsername }}
                  </div>
                </li>
                <li class="mb-3 d-flex align-items-center">
                  <i class="bi bi-clock me-3 fs-4 text-primary"></i>
                  <div>
                    <strong>Duration:</strong><br>
                    {{ formatDuration(classData.start_time, classData.end_time) }}
                  </div>
                </li>
                <li class="mb-3 d-flex align-items-center">
                  <i class="bi bi-currency-dollar me-3 fs-4 text-primary"></i>
                  <div>
                    <strong>Price:</strong><br>
                    ${{ classData.price.toFixed(2) }}
                  </div>
                </li>
  
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div class="modal fade" id="successModal" tabindex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="successModalLabel">Review Submitted</h5>
            
          </div>
          <div class="modal-body">
            <p class="mb-0">Your review has been submitted successfully! Thank you for your feedback.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn custom-btn" @click="goToProfile">Go to Profile</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, runTransaction } from 'firebase/firestore';
import { db } from '../firebase/firebase_config';
import StarRating from '../components/StarRating.vue';
import FBInstanceAuth from '../firebase/firebase_auth';
import { Modal } from 'bootstrap';

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
    const teacherUsername = ref('');

    const isValidReview = computed(() => {
      return reviewText.value.trim().length > 0 && selectedRating.value > 0;
    });

    const fetchClassData = async () => {
      try {
        const classDoc = await getDoc(doc(db, 'classes', props.classId));
        if (classDoc.exists()) {
          classData.value = { id: classDoc.id, ...classDoc.data() };
          await fetchTeacherUsername(classData.value.teacher_username);
        } else {
          error.value = 'Class not found.';
        }
      } catch (err) {
        error.value = `Error: ${err.message}`;
      } finally {
        loading.value = false;
      }
    };

    const fetchTeacherUsername = async (teacherId) => {
      try {
        const teacherDoc = await getDoc(doc(db, 'users', teacherId));
        if (teacherDoc.exists()) {
          teacherUsername.value = teacherDoc.data().username;
        } else {
          teacherUsername.value = 'Unknown';
        }
      } catch (err) {
        console.error('Error fetching teacher username:', err);
        teacherUsername.value = 'Unknown';
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

    const submitReview = async () => {
  if (!isValidReview.value) {
    error.value = 'Please provide both a rating and review text.';
    return;
  }

  try {
    const classRef = doc(db, 'classes', props.classId);
    const instructorId = classData.value.teacher_username;
    
    if (!instructorId) {
      throw new Error('Instructor ID is missing from class data.');
    }
    
    const teacherRef = doc(db, 'users', instructorId);
    const currentUserRef = doc(db, 'users', currentUser.value.id);
    
    await runTransaction(db, async (transaction) => {
      // Get all necessary documents
      const classDoc = await transaction.get(classRef);
      const teacherDoc = await transaction.get(teacherRef);
      
      if (!classDoc.exists()) {
        throw new Error('Class does not exist!');
      }
      if (!teacherDoc.exists()) {
        throw new Error('Teacher does not exist!');
      }
      
      // Calculate new ratings for the class
      const classData = classDoc.data();
      const currentRatingsAverage = classData.ratings_average || 0;
      const currentReviewCount = Array.isArray(classData.reviews) ? classData.reviews.length : 0;
      
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
      
      // Calculate new teacher ratings
      const teacherData = teacherDoc.data();
      const currentTeacherAverage = teacherData.teacher_average || 0;
      const teacherReviewCount = teacherData.total_reviews || 0;
      
      const newTeacherAverage = calculateNewAverage(
        currentTeacherAverage,
        teacherReviewCount,
        selectedRating.value
      );

      // Update class document
      transaction.update(classRef, {
        reviews: arrayUnion(review),
        ratings_average: newClassAverage
      });
      
      // Update teacher document
      transaction.update(teacherRef, {
        teacher_average: newTeacherAverage,
        total_reviews: teacherReviewCount + 1
      });

     // Get the current posted_classes array
     const postedClasses = teacherData.posted_classes || [];
      
      // Create a new array with the updated class
      const updatedPostedClasses = postedClasses.map(postedClass => {
        if (postedClass.class_id === props.classId) {
          return {
            ...postedClass, // Preserve all existing fields
            reviews: [...(postedClass.reviews || []), review], // Add new review to existing reviews
            ratings_average: newClassAverage // Update ratings average
          };
        }
        return postedClass; // Return unchanged for other classes
      });

      // Update the entire posted_classes array
      transaction.update(teacherRef, {
        posted_classes: updatedPostedClasses
      });

      // Remove the class ID from the current user's pending_reviews
      transaction.update(currentUserRef, {
        pending_reviews: arrayRemove(props.classId)
      });
    });
    
    // Show success modal
    const successModal = new Modal(document.getElementById('successModal'));
    successModal.show();
  } catch (err) {
    error.value = `Error submitting review: ${err.message}`;
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

    const formatDuration = (startTime, endTime) => {
      if (!startTime || !endTime) return 'Duration not available';
      const start = startTime.toDate();
      const end = endTime.toDate();
      const durationMs = end - start;
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    };

    const goBack = () => {
      router.go(-1);
    };

    const goToProfile = () => {
      router.push({ name: 'ProfilePage' });
      const modal = Modal.getInstance(document.getElementById('successModal'));
      if (modal) {
        modal.hide();
      }
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
      formatDuration,
      isValidReview,
      goBack,
      goToProfile,
      teacherUsername
    };
  }
};
</script>

<style scoped>
.reviews-page {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.container-fluid {
  max-width: 1400px;
}

.class-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  object-position: center;
}

.overlay-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.7));
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

.custom-bg {
  background-color: #5a7dee;
}

.custom-btn {
  padding: 0.5rem 1rem;
  text-align: center;
  text-decoration: none;
  border-radius: 0.375rem;
  background-color: #5a7dee;
  color: white;
  border: none;
  transition: all 0.2s ease;
}

.custom-btn:hover {
  background-color: #4e6dd2;
  color: white;
  transform: translateY(-1px);
}

.spinner-border.text-primary {
  color: #5a7dee !important;
}

.back-link {
  color: #5a7dee;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: #4e6dd2;
}

.modal-content {
  border-radius: 0.5rem;
  overflow: hidden;
}

.modal-header {
  border-bottom: none;
}

.modal-footer {
  border-top: none;
}

.card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}
</style>