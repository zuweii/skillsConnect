<template>
  <div class="home">
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
      <!-- Upcoming Classes Sections -->
      <div class="row mb-5">
        <!-- Student Classes -->
        <div class="col-md-6 mb-4">
          <div class="card shadow-sm gradient-border">
            <div class="card-header bg-white border-0 shadow-sm py-3">
              <h2 class="h5 mb-0 fw-bold d-flex align-items-center">
                <i class="bi bi-journal-text me-2 text-primary"></i>
                My Upcoming Classes as Student
                <span class="badge bg-primary ms-2 rounded-pill">
                  {{ upcomingClassesAsStudent.length }}
                </span>
              </h2>
            </div>
            <div class="card-body p-0">
              <div v-if="upcomingClassesAsStudent.length === 0"
                class="p-4 upcoming-list d-flex align-items-center justify-content-center text-muted">
                No upcoming classes as student
              </div>
              <div v-else class="upcoming-list">
                <div v-for="classItem in upcomingClassesAsStudent" :key="classItem.id"
                  class="upcoming-item p-3 border-bottom">
                  <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                      <h6 class="mb-2 fw-bold">{{ classItem.title }}</h6>
                      <div class="d-flex align-items-center mb-2">
                        <i class="bi bi-geo-alt me-2 text-primary"></i>
                        <span>{{
                          classItem.location === "N.A."
                          ? "Online"
                          : classItem.location
                        }}</span>
                      </div>
                      <div class="d-flex align-items-center mb-2">
                        <i class="bi bi-calendar3 me-2 text-primary"></i>
                        <span>{{
                          formatDate(calculateNextLessonDate(classItem))
                        }}</span>
                      </div>
                      <div class="d-flex align-items-center">
                        <i class="bi bi-clock me-2 text-primary"></i>
                        <span>{{ formatTime(classItem.start_time) }} -
                          {{ formatTime(classItem.end_time) }}</span>
                      </div>
                      <div class="mt-2">
                        <span class="badge bg-primary">
                          <i class="bi bi-book me-1"></i>
                          Lesson {{ getCurrentLessonNumber(classItem) }} of
                          {{ classItem.number_of_lessons }}
                        </span>
                      </div>
                    </div>
                    <router-link :to="{ name: 'ClassDetails', params: { id: classItem.id } }"
                      class="btn btn-outline-primary btn-sm ms-3">
                      Details
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        <!-- Teacher Classes -->
        <div class="col-md-6 mb-4">
          <div class="card shadow-sm gradient-border">
            <div class="card-header bg-white border-0 shadow-sm py-3">
              <h2 class="h5 mb-0 fw-bold d-flex align-items-center">
                <i class="bi bi-easel me-2 text-primary"></i>
                My Upcoming Classes as Teacher
                <span class="badge bg-primary ms-2 rounded-pill">
                  {{ upcomingClassesAsTeacher.length }}
                </span>
              </h2>
            </div>
            <div class="card-body p-0">
              <div v-if="upcomingClassesAsTeacher.length === 0"
                class="p-4 upcoming-list d-flex align-items-center justify-content-center text-muted">
                No upcoming classes as teacher
              </div>
              <div v-else class="upcoming-list">
                <div v-for="classItem in upcomingClassesAsTeacher" :key="classItem.id"
                  class="upcoming-item p-3 border-bottom">
                  <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                      <h6 class="mb-2 fw-bold">{{ classItem.title }}</h6>
                      <div class="d-flex align-items-center mb-2">
                        <i class="bi bi-geo-alt me-2 text-primary"></i>
                        <span>{{
                          classItem.location === "N.A."
                          ? "Online"
                          : classItem.location
                        }}</span>
                      </div>
                      <div class="d-flex align-items-center mb-2">
                        <i class="bi bi-calendar3 me-2 text-primary"></i>
                        <span>{{
                          formatDate(calculateNextLessonDate(classItem))
                        }}</span>
                      </div>
                      <div class="d-flex align-items-center">
                        <i class="bi bi-clock me-2 text-primary"></i>
                        <span>{{ formatTime(classItem.start_time) }} -
                          {{ formatTime(classItem.end_time) }}</span>
                      </div>
                      <div class="mt-2 d-flex gap-2">
                        <span class="badge bg-primary">
                          <i class="bi bi-book me-1"></i>
                          Lesson {{ getCurrentLessonNumber(classItem) }} of
                          {{ classItem.number_of_lessons }}
                        </span>
                        <span class="badge bg-secondary">
                          <i class="bi bi-people-fill me-1"></i>
                          {{ classItem.current_enrollment }}/{{
                            classItem.max_capacity
                          }}
                          Students
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Rated Classes Section -->
      <h2 class="h3 mb-4 fw-bold">Top Rated Classes</h2>
      <div class="row mb-5">
        <div v-for="classItem in topRatedClasses" :key="classItem.id" class="col-lg-3 col-md-4 col-sm-6 mb-4">
          <div class="card shadow-sm h-100 hover-card">
            <div class="card-img-wrapper">
              <img :src="classItem.image" :alt="classItem.title" class="card-img-top class-image" />
              <div class="card-img-overlay-top">
                <span class="badge bg-primary">
                  {{ classItem.category }}
                </span>
              </div>
            </div>
            <div class="card-body d-flex flex-column">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="card-title fw-bold mb-0">{{ classItem.title }}</h5>
              </div>
              <p class="card-text text-muted small flex-grow-1">
                {{ truncateText(classItem.description, 100) }}
              </p>
              <div class="mt-auto">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <p class="card-text h5 text-primary mb-0">
                    ${{ classItem.price.toFixed(2) }}
                  </p>
                  <span class="badge bg-light text-dark">
                    <i class="bi bi-people-fill me-1"></i>
                    {{ classItem.current_enrollment }} / {{ classItem.max_capacity }} enrolled
                  </span>
                </div>
                <div class="d-flex align-items-center mb-2">
                  <span class="me-2">{{ classItem.ratings_average.toFixed(1) }}</span>
                  <StarRating :rating="classItem.ratings_average" />
                  <span class="text-muted ms-2 fs-6">({{ classItem.reviews.length }})</span>
                </div>
                <router-link :to="{ name: 'ClassDetails', params: { id: classItem.id } }" class="custom-button w-100">
                  View Details
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 class="h3 mb-4 fw-bold">Nearby Classes</h2>
      <div v-if="loadingNearby" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading nearby classes...</span>
        </div>
      </div>
      <div v-else-if="nearbyClasses.length === 0" class="alert alert-info">
        No classes found within 5km of your location.
      </div>
      <div v-else class="row mb-5">
        <div v-for="classItem in nearbyClasses" :key="classItem.id" class="col-lg-3 col-md-6 col-sm-6 mb-4">
          <div class="card shadow-sm h-100 hover-card">
            <div class="card-img-wrapper">
              <img :src="classItem.image" :alt="classItem.title" class="card-img-top class-image" />
              <div class="card-img-overlay-top">
                <span class="badge bg-primary">
                  {{ classItem.category }}
                </span>
              </div>
            </div>
            <div class="card-body d-flex flex-column">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="card-title fw-bold mb-0">{{ classItem.title }}</h5>
              </div>
              <p class="card-text text-muted small flex-grow-1">
                {{ truncateText(classItem.description, 100) }}
              </p>
              <div class="mt-auto">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <p class="card-text h5 text-primary mb-0">
                    ${{ classItem.price.toFixed(2) }}
                  </p>
                  <span class="badge bg-light text-dark">
                    <i class="bi bi-people-fill me-1"></i>
                    {{ classItem.current_enrollment }} / {{ classItem.max_capacity }} enrolled
                  </span>
                </div>
                <div class="d-flex align-items-center mb-2">
                  <span class="me-2">{{ classItem.ratings_average.toFixed(1) }}</span>
                  <StarRating :rating="classItem.ratings_average" />
                  <span class="text-muted ms-2 fs-6">({{ classItem.reviews.length }})</span>
                </div>
                <router-link :to="{ name: 'ClassDetails', params: { id: classItem.id } }" class="custom-button w-100">
                  View Details
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Available Classes Section -->
      <h2 class="h3 mb-4 fw-bold">Available Classes</h2>

      <!-- Categories Section -->
      <div class="categories-section mb-4">
        <div class="categories-btn-group">
          <button class="category-btn" :class="{ active: selectedCategory === null }" @click="selectCategory(null)">
            All
          </button>
          <button v-for="category in categories" :key="category.category_name" class="category-btn"
            :class="{ active: selectedCategory === category.category_name }"
            @click="selectCategory(category.category_name)">
            {{ category.category_name }}
          </button>
        </div>
      </div>


      <div class="row mb-5">
        <div v-for="classItem in availableClasses" :key="classItem.id" class="col-lg-3 col-md-4 col-sm-6 mb-4">
          <div class="card shadow-sm h-100 hover-card">
            <div class="card-img-wrapper">
              <img :src="classItem.image" :alt="classItem.title" class="card-img-top class-image" />
              <div class="card-img-overlay-top">
                <span class="badge bg-primary">
                  {{ classItem.category }}
                </span>
              </div>
            </div>
            <div class="card-body d-flex flex-column">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="card-title fw-bold mb-0">{{ classItem.title }}</h5>
              </div>
              <p class="card-text text-muted small flex-grow-1">
                {{ truncateText(classItem.description, 100) }}
              </p>
              <div class="mt-auto">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <p class="card-text h5 text-primary mb-0">
                    ${{ classItem.price.toFixed(2) }}
                  </p>
                  <span class="badge bg-light text-dark">
                    <i class="bi bi-people-fill me-1"></i>
                    {{ classItem.current_enrollment }} / {{ classItem.max_capacity }} enrolled
                  </span>
                </div>
                <div class="d-flex align-items-center mb-2">
                  <span class="me-2">{{ classItem.ratings_average.toFixed(1) }}</span>
                  <StarRating :rating="classItem.ratings_average" />
                  <span class="text-muted ms-2 fs-6">({{ classItem.reviews.length }})</span>
                </div>
                <router-link :to="{ name: 'ClassDetails', params: { id: classItem.id } }" class="custom-button w-100">
                  View Details
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  </div>
</template>
   
   
<script>
import { ref, computed, onMounted, watch } from "vue";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebase/firebase_config";
import FBInstanceAuth from "../firebase/firebase_auth";
import StarRating from "../components/StarRating.vue";

export default {
  name: "HomePage",
  components: {
    StarRating,
  },
  props: {
    searchQuery: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const classes = ref([]);
    const categories = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const currentUser = ref(null);
    const selectedCategory = ref(null);
    const nearbyClasses = ref([]);
    const userLocation = ref(null);
    const loadingNearby = ref(false);
    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    const topRatedClasses = computed(() => {
      return classes.value
        .sort((a, b) => b.ratings_average - a.ratings_average)
        .slice(0, 4);
    });

    const fetchData = async () => {
      try {
        const user = FBInstanceAuth.getCurrentUser();
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnapshot = await getDoc(userDocRef);

          if (userDocSnapshot.exists()) {
            currentUser.value = {
              id: userDocSnapshot.id,
              ...userDocSnapshot.data(),
            };
          }
        }

        const classCollection = collection(db, "classes");
        const classQuery = query(classCollection, orderBy("ratings_average", "desc"), limit(50));
        const classSnapshot = await getDocs(classQuery);
        classes.value = classSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        await fetchCategories();
        await checkCompletedClasses();
        await findNearbyClasses();
      } catch (err) {
        console.error("Error fetching data:", err);
        error.value = "Error loading data";
      } finally {
        loading.value = false;
      }
    };




    const checkCompletedClasses = async () => {
      if (!currentUser.value) return;

      const currentDate = new Date();
      const completedClasses = classes.value.filter((classItem) => {
        // Check if completion_date exists, otherwise fall back to end_time
        const completionDate = classItem.completion_date ? classItem.completion_date.toDate() : classItem.end_time.toDate();
        return completionDate < currentDate;
      });
      if (completedClasses.length > 0) {
        const userRef = doc(db, "users", currentUser.value.id);

        // Separate completed classes for student and teacher
        const completedAsStudent = completedClasses.filter((classItem) =>
          currentUser.value.upcoming_classes_as_student?.includes(classItem.id)
        );
        const completedAsTeacher = completedClasses.filter((classItem) =>
          currentUser.value.upcoming_classes_as_teacher?.includes(classItem.id)
        );

        // Update pending_reviews only for classes completed as a student
        const pendingReviewsUpdate = completedAsStudent.map((classItem) => classItem.id);

        // Prepare the update object
        const updateObject = {
          upcoming_classes_as_student: arrayRemove(...completedAsStudent.map(c => c.id)),
          upcoming_classes_as_teacher: arrayRemove(...completedAsTeacher.map(c => c.id)),
        };

        // Only add to pending_reviews if there are completed classes as a student
        if (pendingReviewsUpdate.length > 0) {
          updateObject.pending_reviews = arrayUnion(...pendingReviewsUpdate);
        }

        // Perform the update
        await updateDoc(userRef, updateObject);

        // Refresh user data after updates
        const updatedUserDoc = await getDoc(userRef);
        if (updatedUserDoc.exists()) {
          currentUser.value = {
            id: updatedUserDoc.id,
            ...updatedUserDoc.data(),
          };
        }
      }
    };

    // Computed property for filtered classes
    const filteredClasses = computed(() => {
      let filtered = classes.value;

      if (selectedCategory.value) {
        filtered = filtered.filter(
          (classItem) => classItem.category === selectedCategory.value
        );
      }
      return filtered;
    });



    const availableClasses = computed(() => {
      const currentDate = new Date();
      return filteredClasses.value
        .filter((classItem) => {
          const startDate = classItem.start_date.toDate();
          const startTime = classItem.start_time.toDate();
          const hasAvailability =
            classItem.max_capacity > classItem.current_enrollment;
          const isNotUserClass =
            !currentUser.value?.upcoming_classes_as_teacher?.includes(
              classItem.id
            );

          // Combine date and time for accurate comparison
          const classStartDateTime = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate(),
            startTime.getHours(),
            startTime.getMinutes(),
            startTime.getSeconds()
          );

          classItem.ratings_average = classItem.ratings_average || 0;
          classItem.reviews = classItem.reviews || [];

          return hasAvailability && classStartDateTime > currentDate && isNotUserClass;
        })
        .sort((a, b) => a.start_date.toDate() - b.start_date.toDate());
    });

    const selectCategory = (category) => {
      selectedCategory.value = category;
    };

    const upcomingClassesAsStudent = computed(() => {
      if (!currentUser.value || !currentUser.value.upcoming_classes_as_student)
        return [];

      const currentDate = new Date();
      return classes.value
        .filter((classItem) => {
          const endTime = classItem.end_time.toDate();
          return (
            endTime > currentDate &&
            currentUser.value.upcoming_classes_as_student.includes(classItem.id)
          );
        })
        .sort(
          (a, b) => calculateNextLessonDate(a) - calculateNextLessonDate(b)
        );
    });


    const upcomingClassesAsTeacher = computed(() => {
      if (!currentUser.value || !currentUser.value.upcoming_classes_as_teacher)
        return [];


      const currentDate = new Date();
      return classes.value
        .filter((classItem) => {
          const endTime = classItem.end_time.toDate();
          return (
            endTime > currentDate &&
            currentUser.value.upcoming_classes_as_teacher.includes(classItem.id)
          );
        })
        .sort(
          (a, b) => calculateNextLessonDate(a) - calculateNextLessonDate(b)
        );
    });


    const calculateNextLessonDate = (classItem) => {
      const currentDate = new Date();
      const startDate = classItem.start_date.toDate();
      const numberOfLessons = classItem.number_of_lessons;


      for (let i = 0; i < numberOfLessons; i++) {
        const lessonDate = new Date(startDate);
        lessonDate.setDate(lessonDate.getDate() + i * 7);
        if (lessonDate > currentDate) {
          return lessonDate;
        }
      }
      return startDate;
    };


    const getCurrentLessonNumber = (classItem) => {
      const currentDate = new Date();
      const startDate = classItem.start_date.toDate();


      // If the class hasn't started yet, return 1
      if (currentDate < startDate) {
        return 1;
      }


      // Calculate weeks passed since start date
      const weeksPassed = Math.floor(
        (currentDate - startDate) / (7 * 24 * 60 * 60 * 1000)
      );


      // Return current lesson number (minimum 1, maximum number_of_lessons)
      return Math.min(
        Math.max(weeksPassed + 2, 1),
        classItem.number_of_lessons
      );
    };


    const formatDate = (date) => {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    };


    const formatTime = (timestamp) => {
      return new Date(timestamp.seconds * 1000).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };


    const truncateText = (text, length) => {
      if (text.length <= length) return text;
      return text.substring(0, length) + "...";
    };


    const fetchCategories = async () => {
      try {
        const categoryCollection = collection(db, "categories"); // Ensure the correct path to your categories collection
        const categorySnapshot = await getDocs(categoryCollection);
        categories.value = categorySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (err) {
        console.error("Error fetching categories:", err);
        error.value = "Error loading categories";
      }
    };





    const getUserLocation = () => {
      return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              userLocation.value = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              resolve(userLocation.value);
            },
            (error) => {
              console.error("Error getting user location:", error);
              reject(error);
            }
          );
        } else {
          reject(new Error("Geolocation is not supported by this browser."));
        }
      });
    };


    const geocodeAddress = async (address) => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address
          )}&key=${GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          return data.results[0].geometry.location;
        }
      } catch (error) {
        console.error("Geocoding error:", error);
      }
      return null;
    };


    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radius of Earth in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };


    const findNearbyClasses = async () => {
      loadingNearby.value = true;
      try {
        const location = await getUserLocation();
        const classesWithCoordinates = await Promise.all(
          classes.value.map(async (classItem) => {
            if (!classItem.latitude || !classItem.longitude) {
              const coordinates = await geocodeAddress(classItem.location);
              if (coordinates) {
                return {
                  ...classItem,
                  latitude: coordinates.lat,
                  longitude: coordinates.lng,
                };
              }
            }
            return classItem;
          })
        );

        const nearbyClassesAll = classesWithCoordinates.filter((classItem) => {
          if (classItem.latitude && classItem.longitude) {
            const distance = calculateDistance(
              location.latitude,
              location.longitude,
              classItem.latitude,
              classItem.longitude
            );
            return distance <= 5; // Only classes within 5 km
          }
          return false;
        });

        // Sort nearby classes by distance and limit to 4
        nearbyClasses.value = nearbyClassesAll
          .sort((a, b) => {
            const distanceA = calculateDistance(
              location.latitude,
              location.longitude,
              a.latitude,
              a.longitude
            );
            const distanceB = calculateDistance(
              location.latitude,
              location.longitude,
              b.latitude,
              b.longitude
            );
            return distanceA - distanceB;
          })
          .slice(0, 4);
      } catch (error) {
        console.error("Error finding nearby classes:", error);
      } finally {
        loadingNearby.value = false;
      }
    };


    onMounted(() => {
      fetchData();
    });
    watch(
      () => props.searchQuery,
      () => {
        // You can add any additional logic here when the search query changes
      }
    );


    return {
      availableClasses,
      upcomingClassesAsStudent,
      upcomingClassesAsTeacher,
      categories,
      loading,
      error,
      calculateNextLessonDate,
      getCurrentLessonNumber,
      formatDate,
      formatTime,
      truncateText,
      nearbyClasses,
      loadingNearby,
      selectedCategory,
      selectCategory,
      topRatedClasses,
    };
  },
  //SEARCH BAR (START)
  created() {
    this.$emit("update:showSearchBar", true);
  },
  beforeUnmount() {
    this.$emit("update:showSearchBar", false);
  },
  //SEARCH BAR (END)
};
</script>
   
   
<style scoped>
.home {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.container-fluid {
  max-width: 1400px;
}


.class-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  object-position: center;
}


.card {
  border: 0;
  transition: all 0.3s ease;
  border-radius: 15px;
  overflow: hidden;
}


.gradient-border {
  position: relative;
  border-left: 5px solid #5a7dee;
  border-radius: 0.375rem;
}


.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(90, 124, 238, 0.356) !important;
}


.card-img-wrapper {
  position: relative;
}


.card-img-overlay-top {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 1;
}


.custom-button {
  display: inline-block;
  padding: 0.5rem 1rem;
  font-weight: 500;
  text-align: center;
  text-decoration: none;
  border-radius: 0.375rem;
  background-color: #5a7dee;
  color: white;
  border: none;
  transition: all 0.2s ease;
}


.custom-button:hover {
  background-color: #4e6dd2;
  color: white;
  transform: translateY(-1px);
}


.btn-outline-primary {
  color: #5a7dee;
  border-color: #5a7dee;
}


.btn-outline-primary:hover {
  background-color: #5a7dee;
  border-color: #5a7dee;
  color: white;
}


.text-primary {
  color: #5a7dee !important;
}


.bg-primary {
  background-color: #5a7dee !important;
}


.upcoming-list {
  height: 180px;
  max-height: 180px;
  overflow-y: auto;
}


.upcoming-item:last-child {
  border-bottom: none !important;
}


.upcoming-item:hover {
  background-color: #edf6ff;
}


/* Custom scrollbar */
.upcoming-list::-webkit-scrollbar {
  width: 6px;
}


.upcoming-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}


.upcoming-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}


.upcoming-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}


/* Loading spinner color */
.spinner-border.text-primary {
  color: #5a7dee !important;
}


.badge {
  font-weight: 500;
}


.categories-section {
  margin-bottom: 2rem;
  overflow-x: auto;
  /* Allow horizontal scrolling on very small screens */
}

.categories-btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 5px;
  min-width: min-content;
  /* Ensure buttons don't shrink below their content width */
}

.category-btn {
  border: none;
  background-color: #ecf3fa;
  color: #333;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 25px;
  font-weight: 500;
  white-space: nowrap;
  /* Prevent text wrapping inside buttons */
  flex: 0 0 auto;
  /* Don't allow buttons to grow or shrink */
}

.category-btn:hover {
  background-color: rgba(90, 125, 238, 0.1);
}

.category-btn.active {
  background-color: #5a7dee;
  color: white;
}

/* Optional - Adjust the spacing in the category container */
.category-container {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}


/* Update this if you want specific spacing between category buttons */
.d-flex.gap-2 {
  gap: 12px;
}


.rating-text {
  font-size: 0.5rem;
  color: #6c757d;
}
</style>
   