<template>
    <div class="container-fluid px-4">
      <h2 class="mb-4 pt-4">All Classes Ratings</h2>
      <div v-if="loading" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>
      <div v-else>
        <div class="mb-4">
          <div class="d-flex flex-wrap gap-2 filter-btn-group">
            <button 
              v-for="filter in ['all', 'upcoming', 'past']" 
              :key="filter"
              @click="currentFilter = filter"
              :class="['filter-btn', currentFilter === filter ? 'active' : '']"
            >
              {{ filter.charAt(0).toUpperCase() + filter.slice(1) }} Classes
            </button>
          </div>
        </div>
  
        <div v-if="filteredClasses.length === 0" class="alert alert-info">
          No classes found for the selected filter.
        </div>
        <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          <div v-for="cls in filteredClasses" :key="cls.id" class="col mb-5">
            <div class="card shadow-sm h-100 hover-card">
              <div class="card-img-wrapper">
                <img :src="cls.image || '/placeholder.svg'" :alt="cls.title" class="card-img-top class-image">
                <div class="card-img-overlay-top">

                    <span class="badge" :class="cls.isActive ? 'bg-primary' : 'bg-secondary'">{{ cls.isActive ? 'Upcoming' : 'Past' }}</span>

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
                  <router-link :to="{ name: 'AllReviews', params: { classId: cls.id } }" class="custom-button w-100">
                    View All Reviews
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
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase_config';
import StarRating from '../components/StarRating.vue';

export default {
    name: 'ViewAllReviews',
    components: {
        StarRating
    },
    setup() {
        const route = useRoute();
        const classes = ref([]);
        const loading = ref(true);
        const error = ref(null);
        const currentFilter = ref('all');

        const fetchClasses = async () => {
            try {
                const userId = route.params.userId;
                console.log('Fetching classes for user:', userId);

                const userDoc = await getDoc(doc(db, 'users', userId));

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    console.log('User data:', userData);

                    const postedClasses = userData.posted_classes;
                    console.log('Posted classes:', postedClasses);

                    if (!postedClasses || typeof postedClasses !== 'object') {
                        throw new Error('Invalid posted_classes data');
                    }

                    const now = new Date();

                    for (const classData of Object.values(postedClasses)) {
                        console.log('Processing class:', classData);

                        if (typeof classData !== 'object' || !classData.class_id) {
                            console.warn('Invalid class data:', classData);
                            continue;
                        }

                        const classDoc = await getDoc(doc(db, 'classes', classData.class_id));

                        if (classDoc.exists()) {
                            const fullClassData = { id: classDoc.id, ...classDoc.data() };
                            console.log('Full class data:', fullClassData);

                            fullClassData.isActive = fullClassData.completion_date?.toDate() > now;
                            classes.value.push(fullClassData);
                        } else {
                            console.warn('Class not found:', classData.class_id);
                        }
                    }

                    classes.value.sort((a, b) => b.start_date?.toDate() - a.start_date?.toDate());
                } else {
                    throw new Error('User not found');
                }
            } catch (err) {
                console.error('Error fetching classes:', err);
                error.value = `Error loading classes: ${err.message}`;
            } finally {
                loading.value = false;
            }
        };

        const filteredClasses = computed(() => {
            const now = new Date();
            switch (currentFilter.value) {
                case 'upcoming':
                    return classes.value.filter(cls => cls.isActive);
                case 'past':
                    return classes.value.filter(cls => !cls.isActive);
                default:
                    return classes.value;
            }
        });

        const truncateText = (text, length) => {
            if (typeof text !== 'string') return '';
            if (text.length <= length) return text;
            return text.substring(0, length) + '...';
        };

        const formatDate = (date) => {
            if (!date || !date.toDate) return '';
            const d = date.toDate();
            return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        };

        onMounted(fetchClasses);

        return {
            classes,
            loading,
            error,
            currentFilter,
            filteredClasses,
            truncateText,
            formatDate
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
  height: 200px;
  object-fit: cover;
  object-position: center;
}

.card {
  border: 0;
  transition: all 0.3s ease;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(90, 125, 238, 0.15) !important;
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

.text-primary {
  color: #5a7dee !important;
}

.bg-primary {
  background-color: #5a7dee !important;
}

.spinner-border.text-primary {
  color: #5a7dee !important;
}

.filter-btn-group {
  display: flex;
  border-radius: 50px;
  padding: 5px;
}

.filter-btn {
  border: none;
  background-color: transparent;
  color: #333;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 25px;
  font-weight: 500;
}

.filter-btn:hover {
  background-color: rgba(90, 125, 238, 0.1);
}

.filter-btn.active {
  background-color: #5a7dee;
  color: white;
}

@media (max-width: 768px) {
  .filter-btn-group {
    flex-direction: column;
    border-radius: 15px;
  }

  .filter-btn {
    width: 100%;
    border-radius: 10px;
    margin: 5px 0;
  }
}
</style>