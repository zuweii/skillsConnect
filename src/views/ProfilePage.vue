<template>
  <div class="profile-view">
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
    <div v-else class="container-fluid px-4">
      <!-- Profile Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card shadow-sm gradient-border">
            <div class="card-body p-4">
              <div class="row align-items-center">
                <div class="col-md-auto mb-3 mb-md-0">
                  <img :src="userProfile.profile_photo || defaultPhoto" :alt="userProfile.username" class="rounded-circle"
                    style="width: 150px; height: 150px; object-fit: cover;">
                </div>
                <div class="col-md">
                  <h2 class="card-title mb-2">{{ userProfile.username }}</h2>
                  <div class="d-flex align-items-center mb-2">
                    <span class="me-2">Average Class Rating:</span>
                    <StarRating :rating="userProfile.teacher_average || 0" readOnly />
                    <span class="ms-2">({{ (userProfile.teacher_average || 0).toFixed(1) }})</span>
                  </div>
                  <router-link v-if="userProfile.id" :to="{ name: 'ViewAllReviews', params: { userId: userProfile.id } }"
                    class="text-primary">
                    View All Class Ratings
                  </router-link>
                </div>
                <div class="col-md-auto mt-3 mt-md-0">
                  <button @click="showEditProfileModal = true" class="btn btn-primary">
                    Edit Profile Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <!-- Left Column: Classes and Reviews -->
        <div class="col-lg-8 mb-4">
          <!-- Tabs Section -->
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <ul class="nav nav-tabs" id="profileTabs" role="tablist">
                <li class="nav-item" role="presentation">
                  <button @click="currentTab = 'student'" :class="{ active: currentTab === 'student' }" class="nav-link"
                    id="student-tab" data-bs-toggle="tab" data-bs-target="#student" type="button" role="tab"
                    aria-controls="student" aria-selected="true">Upcoming Classes as Student</button>
                </li>
                <li class="nav-item" role="presentation">
                  <button @click="currentTab = 'teaching'" :class="{ active: currentTab === 'teaching' }" class="nav-link"
                    id="teaching-tab" data-bs-toggle="tab" data-bs-target="#teaching" type="button" role="tab"
                    aria-controls="teaching" aria-selected="false">Classes Listed by You</button>
                </li>
                <li class="nav-item" role="presentation">
                  <button @click="currentTab = 'review'" :class="{ active: currentTab === 'review' }" class="nav-link"
                    id="review-tab" data-bs-toggle="tab" data-bs-target="#review" type="button" role="tab"
                    aria-controls="review" aria-selected="false">Classes to Review</button>
                </li>
                <li class="nav-item" role="presentation">
                  <button @click="currentTab = 'portfolio'" :class="{ active: currentTab === 'portfolio' }"
                    class="nav-link" id="portfolio-tab" data-bs-toggle="tab" data-bs-target="#portfolio" type="button"
                    role="tab" aria-controls="portfolio" aria-selected="false">Portfolio</button>
                </li>
              </ul>

              <div class="tab-content mt-4" id="profileTabsContent">
                <!-- Upcoming Classes as Student -->
                <div :class="{ 'active show': currentTab === 'student' }" class="tab-pane fade" id="student"
                  role="tabpanel" aria-labelledby="student-tab">
                  <div class="mb-4">
                    <label for="studentFilterType" class="form-label">Filter by:</label>
                    <div class="d-flex gap-2">
                      <select v-model="studentFilterType" id="studentFilterType" class="form-select w-auto">
                        <option value="day">Day</option>
                        <option value="month">Month</option>
                        <option value="year">Year</option>
                      </select>
                      <input v-if="studentFilterType === 'day'" type="date" v-model="studentFilterValue"
                        class="form-control w-auto">
                      <input v-if="studentFilterType === 'month'" type="month" v-model="studentFilterValue"
                        class="form-control w-auto">
                      <input v-if="studentFilterType === 'year'" type="number" v-model="studentFilterValue"
                        class="form-control w-auto" placeholder="Enter year">
                    </div>
                  </div>
                  <div v-if="filteredUpcomingClassesAsStudent.length === 0" class="alert alert-info">
                    No upcoming classes as student.
                  </div>
                  <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    <div v-for="cls in filteredUpcomingClassesAsStudent" :key="cls.id" class="col">
                      <div class="card shadow-sm h-100 hover-card">
                        <div class="card-img-wrapper">
                          <img :src="cls.image || '/placeholder.svg'" :alt="cls.title" class="card-img-top class-image">
                          <div class="card-img-overlay-top">
                            <span class="badge bg-primary">
                              {{ cls.category }}
                            </span>
                          </div>
                        </div>
                        <div class="card-body d-flex flex-column">
                          <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title fw-bold mb-0">{{ cls.title }}</h5>
                          </div>

                          <p class="card-text text-muted small flex-grow-1">{{ truncateText(cls.description, 100) }}</p>
                          <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                              <p class="card-text h5 text-primary mb-0">${{ cls.price?.toFixed(2) || '0.00' }}</p>
                              <span class="badge bg-light text-dark">
                                <i class="bi bi-people-fill me-1"></i>
                                {{ cls.current_enrollment }} / {{ cls.max_capacity }} enrolled
                              </span>
                            </div>
                            <div class="d-flex align-items-center mb-2">
                              <span class="me-2">{{ cls.ratings_average.toFixed(1) }}</span>
                              <StarRating :rating="cls.ratings_average" readOnly />
                              <span class="text-muted ms-2 fs-6">({{ cls.reviews.length }})</span>
                            </div>
                            <router-link :to="{ name: 'ClassDetails', params: { id: cls.id } }"
                              class="btn btn-primary custom-button btn-sm w-100">
                              View Details
                            </router-link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Classes Listed by You -->
                <div :class="{ 'active show': currentTab === 'teaching' }" class="tab-pane fade" id="teaching"
                  role="tabpanel" aria-labelledby="teaching-tab">
                  <div class="mb-4">
                    <div class="btn-group" role="group" aria-label="Class filter">
                      <button @click="teachingClassFilter = 'current'"
                        :class="['btn', teachingClassFilter === 'current' ? 'btn-primary' : 'btn-outline-primary']">
                        Current Classes
                      </button>
                      <button @click="teachingClassFilter = 'past'"
                        :class="['btn', teachingClassFilter === 'past' ? 'btn-primary' : 'btn-outline-primary']">
                        Past Classes
                      </button>
                    </div>
                  </div>
                  <div class="mb-4">
                    <label for="teachingFilterType" class="form-label">Filter by:</label>
                    <div class="d-flex gap-2">
                      <select v-model="teachingFilterType" id="teachingFilterType" class="form-select w-auto">
                        <option value="day">Day</option>
                        <option value="month">Month</option>
                        <option value="year">Year</option>
                      </select>
                      <input v-if="teachingFilterType === 'day'" type="date" v-model="teachingFilterValue"
                        class="form-control w-auto">
                      <input v-if="teachingFilterType === 'month'" type="month" v-model="teachingFilterValue"
                        class="form-control w-auto">
                      <input v-if="teachingFilterType === 'year'" type="number" v-model="teachingFilterValue"
                        class="form-control w-auto" placeholder="Enter year">
                    </div>
                  </div>
                  <div v-if="filteredTeachingClasses.length === 0" class="alert alert-info">
                    No classes found.
                  </div>
                  <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    <div v-for="cls in filteredTeachingClasses" :key="cls.id" class="col">
                      <div class="card shadow-sm h-100 hover-card">
                        <div class="card-img-wrapper">
                          <img :src="cls.image || '/placeholder.svg'" :alt="cls.title" class="card-img-top class-image">
                          <div class="card-img-overlay-top">
                            <span class="badge bg-primary">
                              {{ cls.category }}
                            </span>
                          </div>
                        </div>
                        <div class="card-body d-flex flex-column">
                          <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title fw-bold mb-0">{{ cls.title }}</h5>
                          </div>

                          <p class="card-text text-muted small flex-grow-1">{{ truncateText(cls.description, 100) }}</p>
                          <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                              <p class="card-text h5 text-primary mb-0">${{ cls.price?.toFixed(2) || '0.00' }}</p>
                              <span class="badge bg-light text-dark">
                                <i class="bi bi-people-fill me-1"></i>
                                {{ cls.current_enrollment }} / {{ cls.max_capacity }} enrolled
                              </span>
                            </div>
                            <div class="d-flex align-items-center mb-2">
                              <span class="me-2">{{ cls.ratings_average.toFixed(1) }}</span>
                              <StarRating :rating="cls.ratings_average" readOnly />
                              <span class="text-muted ms-2 fs-6">({{ cls.reviews.length }})</span>
                            </div>
                            <button v-if="cls.isActive" @click="openRelistModal(cls)"
                              class="btn btn-primary custom-button btn-sm w-100">Edit Class</button>
                            <button v-else @click="openRelistModal(cls)"
                              class="btn btn-secondary custom-button-relist btn-sm w-100">Relist Class</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Classes to Review -->
                <div :class="{ 'active show': currentTab === 'review' }" class="tab-pane fade" id="review" role="tabpanel"
                  aria-labelledby="review-tab">
                  <div v-if="classesToReview.length === 0" class="alert alert-info">
                    No classes to review.
                  </div>
                  <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    <div v-for="cls in classesToReview" :key="cls.id" class="col">
                      <div class="card shadow-sm h-100 hover-card">
                        <div class="card-img-wrapper">
                          <img :src="cls.image || '/placeholder.svg'" :alt="cls.title" class="card-img-top class-image">
                          <div class="card-img-overlay-top">
                            <span class="badge bg-primary">
                              {{ cls.category }}
                            </span>
                          </div>
                        </div>
                        <div class="card-body d-flex flex-column">
                          <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title fw-bold mb-0">{{ cls.title }}</h5>
                          </div>

                          <p class="card-text text-muted small flex-grow-1">{{ truncateText(cls.description, 100) }}</p>
                          <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                              <p class="card-text h5 text-primary mb-0">${{ cls.price?.toFixed(2) || '0.00' }}</p>
                              <span class="badge bg-light text-dark">
                                <i class="bi bi-people-fill me-1"></i>
                                {{ cls.current_enrollment }} / {{ cls.max_capacity }} enrolled
                              </span>
                            </div>
                            <div class="d-flex align-items-center mb-2">
                              <span class="me-2">{{ cls.ratings_average.toFixed(1) }}</span>
                              <StarRating :rating="cls.ratings_average" readOnly />
                              <span class="text-muted ms-2 fs-6">({{ cls.reviews.length }})</span>
                            </div>
                            <router-link :to="{ name: 'ReviewsPage', params: { classId: cls.id } }"
                              class="btn btn-primary custom-button btn-sm w-100">
                              Review Class
                            </router-link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


                <!-- Portfolio Uploads Tab -->
                <div :class="{ 'active show': currentTab === 'portfolio' }" class="tab-pane fade" id="portfolio"
                  role="tabpanel" aria-labelledby="portfolio-tab">
                  <div v-if="userProfile.portfolio && userProfile.portfolio.length > 0">
                    <h3 class="mb-4">My Portfolio Projects</h3>
                    <div class="row row-cols-1 row-cols-md-2 g-4">
                      <div v-for="(project, index) in userProfile.portfolio" :key="index" class="col">
                        <div class="card shadow-sm">
                          <div class="portfolio-media">
                            <img v-if="project.imageUrl" :src="project.imageUrl" alt="Project Image"
                              class="portfolio-image card-img-top">
                            <div v-if="project.youtubeLink"
                              class="embed-responsive embed-responsive-16by9 portfolio-video">
                              <iframe :src="formatYouTubeEmbedUrl(project.youtubeLink)" frameborder="0" allowfullscreen
                                class="embed-responsive-item"></iframe>
                            </div>
                          </div>
                          <div class="card-body">
                            <h5 class="card-title">{{ project.title }}</h5>
                            <p class="card-text">{{ project.description }}</p>

                            <button @click="openEditModal(project, index)" class="btn btn-secondary mt-2">Edit</button>
                            <button @click="confirmDeleteProject(project, index)"
                              class="btn btn-danger mt-2">Delete</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-muted text-center">
                    No portfolio
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Analytics and Portfolio Form -->
        <div class="col-lg-4">
          <!-- Portfolio Form -->
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <h3 class="card-title mb-4">Add to Portfolio</h3>
              <form @submit.prevent="addPortfolioProject">
                <div class="mb-3">
                  <label for="projectTitle" class="form-label">Project Title</label>
                  <input type="text" v-model="newProject.title" id="projectTitle" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label for="projectDescription" class="form-label">Description</label>
                  <textarea v-model="newProject.description" id="projectDescription" class="form-control" rows="3"
                    required></textarea>
                </div>
                <div class="mb-3">
                  <label for="youtubeLink" class="form-label">YouTube Link</label>
                  <input type="url" v-model="newProject.youtubeLink" id="youtubeLink" class="form-control"
                    placeholder="https://www.youtube.com/watch?v=example">
                </div>
                <div class="mb-3">
                  <label for="projectImage" class="form-label">Project Image</label>
                  <input type="file" @change="handleImageUpload" id="projectImage" class="form-control">
                </div>
                <button type="submit" class="btn btn-primary w-100">Add Project</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="relistModal" tabindex="-1" aria-labelledby="relistModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="relistModalLabel">Relist Class</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitRelist">
              <div class="mb-3">
                <label for="newStartDate" class="form-label">New Start Date</label>
                <input type="date" class="form-control" id="newStartDate" v-model="relistData.newStartDate" required>
              </div>
              <div class="mb-3">
                <label for="newStartTime" class="form-label">New Start Time</label>
                <input type="time" class="form-control" id="newStartTime" v-model="relistData.newStartTime" required>
              </div>
              <div class="mb-3">
                <label for="newEndTime" class="form-label">New End Time</label>
                <input type="time" class="form-control" id="newEndTime" v-model="relistData.newEndTime" required>
              </div>
              <button type="submit" class="btn btn-primary">Relist Class</button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Portfolio Modal -->
    <div class="modal fade" id="editPostModal" tabindex="-1" aria-labelledby="editPostModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editPostModalLabel">Edit Portfolio Project</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitEditProject">
              <div class="mb-3">
                <label for="editProjectTitle" class="form-label">Project Title</label>
                <input type="text" v-model="editProject.title" id="editProjectTitle" class="form-control" required>
              </div>
              <div class="mb-3">
                <label for="editProjectDescription" class="form-label">Description</label>
                <textarea v-model="editProject.description" id="editProjectDescription" class="form-control" rows="3"
                  required></textarea>
              </div>
              <div class="mb-3">
                <label for="editYouTubeLink" class="form-label">YouTube Link</label>
                <input type="url" v-model="editProject.youtubeLink" id="editYouTubeLink" class="form-control">
              </div>
              <div class="mb-3">
                <label for="editProjectImage" class="form-label">Project Image</label>
                <input type="file" @change="handleEditImageUpload" id="editProjectImage" class="form-control">
              </div>
              <button type="submit" class="btn btn-primary w-100">Save Changes</button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal fade show" tabindex="-1" style="display: block;" role="dialog">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Delete</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            Are you sure you want to delete this project? This action cannot be undone.
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Cancel</button>
            <button type="button" class="btn btn-danger" @click="deleteProject">Delete</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>


<script>
import { ref, onMounted, computed } from 'vue';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase_config';
import { getAuth } from 'firebase/auth';
import { Modal } from 'bootstrap';
import StarRating from '../components/StarRating.vue';
import EditProfileModal from './EditProfileModal.vue';

export default {
  components: {
    StarRating,
    EditProfileModal,
  },
  setup() {
    const auth = getAuth();
    const userProfile = ref({});
    const upcomingClassesAsStudent = ref([]);
    const teachingClasses = ref([]);
    const classesToReview = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const currentTab = ref('student');
    const defaultPhoto = ref('../assets/default-profile.png');
    const showEditProfileModal = ref(false);

    const studentFilterType = ref('day');
    const studentFilterValue = ref('');
    const teachingFilterType = ref('day');
    const teachingFilterValue = ref('');

    const editProject = ref({});
    const editIndex = ref(null);

    const relistData = ref({
      classId: null,
      newStartDate: '',
      newStartTime: '',
      newEndTime: ''
    });

    const showDeleteModal = ref(false);
    const projectToDelete = ref(null);
    const projectIndexToDelete = ref(null);

    const newProject = ref({
      title: '',
      description: '',
      youtubeLink: '',
      imageUrl: '',
    });

    const addPortfolioProject = async () => {
      if (!newProject.value.title || !newProject.value.description) return;

      const project = { ...newProject.value };

      if (!Array.isArray(userProfile.value.portfolio)) {
        userProfile.value.portfolio = [];
      }

      userProfile.value.portfolio.push(project);

      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, { portfolio: userProfile.value.portfolio });

        newProject.value = { title: '', description: '', youtubeLink: '', imageUrl: '' };
      } catch (err) {
        console.error('Error updating portfolio:', err);
      }
    };

    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          newProject.value.imageUrl = reader.result;
        };
        reader.readAsDataURL(file);
      }
    };

    const formatYouTubeEmbedUrl = (url) => {
      const videoId = url.split('v=')[1];
      return `https://www.youtube.com/embed/${videoId}`;
    };

    const openEditModal = (project, index) => {
      editProject.value = { ...project };
      editIndex.value = index;
      const modal = new Modal(document.getElementById('editPostModal'));
      modal.show();
    };

    const handleEditImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          editProject.value.imageUrl = reader.result;
        };
        reader.readAsDataURL(file);
      }
    };

    const submitEditProject = async () => {
      if (editIndex.value === null) return;

      userProfile.value.portfolio[editIndex.value] = { ...editProject.value };

      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, { portfolio: userProfile.value.portfolio });

        const modal = Modal.getInstance(document.getElementById('editPostModal'));
        modal.hide();
      } catch (err) {
        console.error('Error updating portfolio:', err);
      }
    };

    const filteredUpcomingClassesAsStudent = computed(() => {
      return filterClasses(upcomingClassesAsStudent.value, studentFilterType.value, studentFilterValue.value);
    });

    const teachingClassFilter = ref('current');
    const filteredTeachingClasses = computed(() => {
      const now = new Date();
      const filtered = filterClasses(teachingClasses.value, teachingFilterType.value, teachingFilterValue.value);
      return filtered.filter(cls => {
        const isActive = new Date(cls.end_time.toDate()) > now;
        cls.isActive = isActive;
        return teachingClassFilter.value === 'current' ? isActive : !isActive;
      });
    });


    const filterClasses = (classes, filterType, filterValue) => {
      if (!filterValue) return classes;
      return classes.filter(cls => {
        const classDate = cls.start_date.toDate();
        switch (filterType) {
          case 'day':
            return classDate.toDateString() === new Date(filterValue).toDateString();
          case 'month':
            const [year, month] = filterValue.split('-');
            return classDate.getFullYear() === parseInt(year) && classDate.getMonth() === parseInt(month) - 1;
          case 'year':
            return classDate.getFullYear() === parseInt(filterValue);
          default:
            return true;
        }
      });
    };


    const fetchUserProfile = async (userID) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userID));
        if (userDoc.exists()) {
          userProfile.value = { id: userDoc.id, ...userDoc.data() };

          // Fetch upcoming classes where the user is a student
          if (userProfile.value.upcoming_classes_as_student.length > 0) {
            const upcomingClassesPromises = userProfile.value.upcoming_classes_as_student.map(classId =>
              getDoc(doc(db, 'classes', classId))
            );

            const upcomingClassesSnapshots = await Promise.all(upcomingClassesPromises);

            // Map and filter the classes to get only future classes
            upcomingClassesAsStudent.value = upcomingClassesSnapshots
              .filter(snapshot => snapshot.exists)
              .map(snapshot => ({ id: snapshot.id, ...snapshot.data() }))
              .filter(cls => new Date(cls.end_time.toDate()) > new Date());

            const teachingClassesQuery = query(
              collection(db, 'classes'),
              where('teacher_username', '==', userID)
            );
            const teachingClassesSnapshot = await getDocs(teachingClassesQuery);
            teachingClasses.value = teachingClassesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            classesToReview.value = await Promise.all(
              (userProfile.value.pending_reviews || []).map(async (classId) => {
                const classDoc = await getDoc(doc(db, 'classes', classId));
                return classDoc.exists() ? { id: classDoc.id, ...classDoc.data() } : null;
              })
            );
            classesToReview.value = classesToReview.value.filter(cls => cls !== null);
          } else {
            console.log("No upcoming classes found in user's upcoming_classes_as_student array.");
          }
        }
      } catch (err) {
        error.value = 'Failed to load user profile. Please try again later.';
        console.error('Error fetching user profile:', err);
      } finally {
        loading.value = false;
      }
    };


    const openRelistModal = (cls) => {
      relistData.value.classId = cls.id;
      const modal = new Modal(document.getElementById('relistModal'));
      modal.show();
    };

    const submitRelist = async () => {
      try {
        const userId = auth.currentUser.uid;
        const classRef = doc(db, 'classes', relistData.value.classId);

        const startDate = new Date(`${relistData.value.newStartDate}T${relistData.value.newStartTime}`);
        const endTime = new Date(`${relistData.value.newStartDate}T${relistData.value.newEndTime}`);
        const completionDate = new Date(startDate);
        const classData = await getDoc(classRef);
        const numberOfLessons = classData.exists() ? classData.data().number_of_lessons : 1;
        completionDate.setDate(completionDate.getDate() + ((numberOfLessons - 1) * 7));

        await updateDoc(classRef, {
          start_date: startDate,
          start_time: startDate,
          end_time: endTime,
          completion_date: completionDate,
        });

        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const postedClasses = userData.posted_classes || [];

          const classIndex = postedClasses.findIndex(postedClass => postedClass.class_id === relistData.value.classId);

          if (classIndex !== -1) {
            postedClasses[classIndex].start_date = startDate;
            postedClasses[classIndex].start_time = startDate;
            postedClasses[classIndex].end_time = endTime;
            postedClasses[classIndex].completion_date = completionDate;

            await updateDoc(userRef, { posted_classes: postedClasses });
          }
        }

        const modal = Modal.getInstance(document.getElementById('relistModal'));
        modal.hide();
        await fetchUserProfile(auth.currentUser.uid);
      } catch (err) {
        console.error('Error relisting class:', err);
      }
    };

    const calculateCompletionDate = (startDate, numberOfLessons) => {
      const completionDate = new Date(startDate);
      completionDate.setDate(completionDate.getDate() + ((numberOfLessons - 1) * 7));
      return completionDate;
    };

    const formatDate = (date) => {
      return date.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatTime = (time) => {
      return time.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const truncateText = (text, length) => {
      if (text.length <= length) return text;
      return text.substring(0, length) + '...';
    };

    function confirmDeleteProject(project, index) {
      projectToDelete.value = project;
      projectIndexToDelete.value = index;
      showDeleteModal.value = true;
    }

    async function deleteProject() {
      if (projectIndexToDelete.value !== null) {
        userProfile.value.portfolio.splice(projectIndexToDelete.value, 1);

        try {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          await updateDoc(userRef, { portfolio: userProfile.value.portfolio });
          showDeleteModal.value = false;
        } catch (err) {
          console.error('Error deleting project:', err);
        }
      }
    };

    onMounted(async () => {
      const user = auth.currentUser;
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        error.value = "User not authenticated";
        loading.value = false;
      }
    });

    return {
      userProfile,
      upcomingClassesAsStudent,
      teachingClasses,
      classesToReview,
      loading,
      error,
      currentTab,
      defaultPhoto,
      studentFilterType,
      studentFilterValue,
      teachingFilterType,
      teachingFilterValue,
      filteredUpcomingClassesAsStudent,
      filteredTeachingClasses,
      openRelistModal,
      relistData,
      submitRelist,
      formatDate,
      formatTime,
      truncateText,
      newProject,
      handleImageUpload,
      addPortfolioProject,
      formatYouTubeEmbedUrl,
      editProject,
      openEditModal,
      handleEditImageUpload,
      submitEditProject,
      showEditProfileModal,
      showDeleteModal,
      projectToDelete,
      projectIndexToDelete,
      confirmDeleteProject,
      deleteProject,
      teachingClassFilter
    };
  },
};
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css');

.profile-view {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.container-fluid {
  max-width: 1400px;
}

.btn-primary {
  background-color: #5a7dee;
  border-color: #5a7dee;
}

.btn-primary:hover,
.btn-primary:focus {
  background-color: #4e6dd2;
  border-color: #4e6dd2;
}

.card {
  border: none;
  border-radius: 0.5rem;
  overflow: hidden;
}

.chart-placeholder {
  height: 200px;
  background-color: #e9ecef;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #6c757d;
}

.text-primary {
  color: #5a7dee !important;
}

.class-image {
  height: 200px;
  object-fit: cover;
}

.gradient-border {
  position: relative;
  border-top: 5px solid #5a7dee;
  border-radius: 0.375rem;
}

.hover-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
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

h2,
h3,
h4,
h5 {
  font-weight: 600;
}

.card-title {
  font-size: 1.25rem;
  color: #333;
}

.text-muted {
  color: #6c757d !important;
}

.bg-primary {
  background-color: #5a7dee !important;
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

.embed-responsive {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  max-width: 100%;
}

.embed-responsive .embed-responsive-item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

@media (max-width: 767.98px) {
  .card-body {
    padding: 1rem;
  }
}

.portfolio-media {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.portfolio-image {
  width: 100%;
  max-height: 280px;
  object-fit: cover;
  border-radius: 5px;
  display: block;
  margin-bottom: 15px;
}

.portfolio-video iframe {
  width: 100%;
  height: 280px;
  border-radius: 5px;
  display: block;
}

.btn-group {
  width: 100%;
  margin-bottom: 1rem;
  border-radius: 50px;
  padding: 5px;
}

.btn-group .btn {
  flex: 1;
  border-radius: 25px;
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
  background-color: #7b88b5;
  color: white;
  transform: translateY(-1px);
}

.custom-button-relist {
  display: inline-block;
  padding: 0.5rem 1rem;
  font-weight: 500;
  text-align: center;
  text-decoration: none;
  border-radius: 0.375rem;
  background-color: #787878;
  color: white;
  border: none;
  transition: all 0.2s ease;
}

.custom-button-relist:hover {
  background-color: #4c4c4c;
  color: white;
  transform: translateY(-1px);
}
</style>