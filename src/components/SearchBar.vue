<template>
  <div class="search-bar-container">
    <div class="search-input-wrapper">
      <i class="bi bi-search search-icon"></i>
      <input
        type="text"
        v-model="searchQuery"
        @input="onInput"
        placeholder="What are you looking for?"
        class="search-input"
      />
      <button v-if="searchQuery" @click="clearSearch" class="clear-button">
        <i class="bi bi-x"></i>
      </button>
    </div>
    
    <div v-if="hasResults" class="suggestions-container">
      <!-- Classes Section -->
      <div v-if="matchingClasses.length > 0" class="suggestion-section">
        <h3 class="section-title">CLASSES</h3>
        <ul class="suggestion-list">
          <li
            v-for="classItem in matchingClasses"
            :key="'class-' + classItem.id"
            @click="selectClass(classItem)"
            class="suggestion-item class-item"
          >
            <img 
              :src="classItem.image || '/placeholder.jpg'" 
              :alt="classItem.title"
              class="suggestion-thumbnail"
            />
            <div class="suggestion-content">
              <span class="suggestion-title">{{ classItem.title }}</span>
              <span class="suggestion-subtitle" v-if="classItem.matchedByDescription">
                Matches description: "...{{ highlightMatch(classItem.description) }}..."
              </span>
            </div>
          </li>
        </ul>
      </div>

      <!-- Teachers Section -->
      <div v-if="matchingTeachers.length > 0" class="suggestion-section">
        <h3 class="section-title">TEACHERS</h3>
        <ul class="suggestion-list">
          <li
            v-for="teacher in matchingTeachers"
            :key="'teacher-' + teacher.id"
            class="suggestion-item teacher-item"
          >
            <keep-alive>
              <router-link 
              :to="{ name: 'ProfileView', params: { userId: teacher.id } }"
              class="text-decoration-none d-flex align-items-center w-100"
            >
              <img 
                :src="teacher.profile_photo || '/placeholder.jpg'" 
                :alt="teacher.username"
                class="suggestion-avatar"
              />
              <div class="suggestion-content">
                <span class="suggestion-title">{{ teacher.username.toUpperCase() }}</span>
                <span class="suggestion-subtitle">
                  Average Rating: {{ teacher.teacher_average ? teacher.teacher_average.toFixed(1) : 'N/A' }}
                </span>
              </div>
            </router-link>
            </keep-alive>

          </li>
        </ul>
      </div>

      <!-- No Results Message -->
      <div v-if="!hasResults && searchQuery.length > 2" class="no-results">
        No results found for "{{ searchQuery }}"
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase_config';

export default {
  name: "SearchBar",
  props: {
    classes: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  emits: ["search"],
  setup(props, { emit }) {
    const searchQuery = ref("");
    const users = ref([]);
    const router = useRouter();

    const matchingClasses = computed(() => {
      if (!searchQuery.value || searchQuery.value.length <= 2) return [];
      
      const query = searchQuery.value.toLowerCase();
      return props.classes
        .filter(item => {
          if (!item) return false;
          const titleMatch = item.title && typeof item.title === 'string' && item.title.toLowerCase().includes(query);
          const descriptionMatch = item.description && typeof item.description === 'string' && item.description.toLowerCase().includes(query);
          if (descriptionMatch) item.matchedByDescription = true;
          return titleMatch || descriptionMatch;
        })
        .slice(0, 5);
    });

    const matchingTeachers = computed(() => {
      if (!searchQuery.value || searchQuery.value.length <= 2) return [];
      
      const query = searchQuery.value.toLowerCase();
      return users.value
        .filter(user => 
          user && 
          user.username && 
          typeof user.username === 'string' &&
          user.username.toLowerCase().includes(query) && 
          user.posted_classes && 
          Array.isArray(user.posted_classes) &&
          user.posted_classes.length > 0
        )
        .slice(0, 5);
    });

    const hasResults = computed(() => {
      return matchingClasses.value.length > 0 || matchingTeachers.value.length > 0;
    });

    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        users.value = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const highlightMatch = (text) => {
      if (!text || typeof text !== 'string') return '';
      const query = searchQuery.value;
      const index = text.toLowerCase().indexOf(query.toLowerCase());
      if (index === -1) return text.slice(0, 50);
      
      const start = Math.max(0, index - 20);
      const end = Math.min(text.length, index + query.length + 20);
      return text.slice(start, end);
    };

    const selectClass = (classItem) => {
      if (classItem && classItem.id) {
        router.push({
          name: "ClassDetails",
          params: { id: classItem.id },
        });
      }
    };

    const clearSearch = () => {
      searchQuery.value = "";
      emit("search", "");
    };

    const onInput = () => {
      emit("search", searchQuery.value);
    };

    // Fetch users when component is mounted
    fetchUsers();

    watch(searchQuery, (newValue) => {
      if (newValue === "") {
        emit("search", "");
      }
    });

    return {
      searchQuery,
      matchingClasses,
      matchingTeachers,
      hasResults,
      onInput,
      selectClass,
      clearSearch,
      highlightMatch,
    };
  },
};
</script>

<style scoped>
.search-bar-container {
  position: relative;
  width: 100%;
  max-width: 700px;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 40px;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  font-size: 16px;
  background-color: rgb(250, 250, 250);
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #5a7dee;
  box-shadow: 0 0 0 2px rgba(90, 125, 238, 0.2);
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.clear-button {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 0;
}

.suggestions-container {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  margin-top: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 600px;
  overflow-y: auto;
}

.section-title {
  padding: 12px 16px;
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.suggestion-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.suggestion-item:hover {
  background-color: #f8f9fa;
}

.suggestion-thumbnail {
  width: 80px;
  height: 45px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 12px;
}

.suggestion-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
}

.suggestion-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.suggestion-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.suggestion-subtitle {
  font-size: 12px;
  color: #666;
}

.no-results {
  padding: 16px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.suggestion-section:not(:last-child) {
  border-bottom: 1px solid #e0e0e0;
}
</style>