<template>
    <div class="settings-container">
      <div class="settings-card">
        <h2 class="text-center">Account Settings</h2>
        
        <form @submit.prevent="updateUserSettings">
          <!-- Profile Picture Update -->
          <div class="form-group mt-4">
            <label for="profilePhoto" class="form-label">Profile Photo</label>
            <input type="file" id="profilePhoto" @change="handleFileUpload" class="form-control-file" />
            <img v-if="previewImage" :src="previewImage" alt="Profile Preview" class="profile-preview mt-3"/>
          </div>
  
          <!-- Username Update -->
          <div class="form-group mt-4">
            <label for="username" class="form-label">Username</label>
            <input type="text" id="username" v-model="username" required class="form-control" />
            <p v-if="usernameError" class="error-message">{{ usernameError }}</p>
          </div>
  
          <!-- Save Button -->
          <button type="submit" class="btn btn-primary w-100 mt-4" :disabled="isLoading">
            {{ isLoading ? 'Updating...' : 'Save Changes' }}
          </button>
  
          <!-- Feedback Message -->
          <p v-if="updateMessage" class="update-message mt-3">{{ updateMessage }}</p>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
  import { db, storage } from '../firebase/firebase_config';
  import { getAuth } from 'firebase/auth';
  import { uploadBytes, getDownloadURL, ref as storageRef } from 'firebase/storage';
  
  export default {
    name: 'Settings',
    setup() {
      const auth = getAuth();
      const user = auth.currentUser;
      const router = useRouter();
  
      const username = ref('');
      const profilePhoto = ref(null);
      const previewImage = ref(null);
      const usernameError = ref(null);
      const updateMessage = ref('');
      const isLoading = ref(false);
  
      const loadUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            username.value = userData.username || '';
            if (userData.profile_photo) {
              previewImage.value = userData.profile_photo;
            }
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      };
  
      const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
          profilePhoto.value = file;
          previewImage.value = URL.createObjectURL(file);
        }
      };
  
      const checkUsernameUnique = async () => {
        const usernameQuery = query(
          collection(db, 'users'),
          where('username', '==', username.value)
        );
        const querySnapshot = await getDocs(usernameQuery);
        return querySnapshot.empty || (querySnapshot.docs[0].id === user.uid);
      };
  
      const updateUserSettings = async () => {
        isLoading.value = true;
        updateMessage.value = '';
        usernameError.value = '';
  
        try {
          if (!(await checkUsernameUnique())) {
            usernameError.value = 'Username is already taken.';
            isLoading.value = false;
            return;
          }
  
          const userDocRef = doc(db, 'users', user.uid);
          let profilePhotoUrl = previewImage.value;
          if (profilePhoto.value) {
            const photoRef = storageRef(storage, `profile-photos/${user.uid}`);
            await uploadBytes(photoRef, profilePhoto.value);
            profilePhotoUrl = await getDownloadURL(photoRef);
          }
  
          await updateDoc(userDocRef, {
            username: username.value,
            profile_photo: profilePhotoUrl,
          });
  
          updateMessage.value = 'Profile updated successfully!';
  
          setTimeout(() => {
            router.push({ name: 'ProfilePage' });
          }, 1000);
        } catch (error) {
          console.error('Error updating profile:', error);
          updateMessage.value = 'Error updating profile. Please try again later.';
        } finally {
          isLoading.value = false;
        }
      };
  
      onMounted(() => {
        loadUserData();
      });
  
      return {
        username,
        profilePhoto,
        previewImage,
        usernameError,
        updateMessage,
        isLoading,
        handleFileUpload,
        updateUserSettings,
      };
    },
  };
  </script>
  
  <style scoped>
  /* Main container styling */
  .settings-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #f0f4ff, #d9e3f0);
    padding: 2rem;
  }
  
  /* Settings card styling */
  .settings-card {
    background-color: #ffffff;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 500px;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .settings-card {
      padding: 1.5rem;
      width: 90%;
    }
  }
  
  /* Form styling */
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-label {
    font-weight: 600;
  }
  
  .form-control {
    border-radius: 6px;
    padding: 0.7rem;
    font-size: 1rem;
  }
  
  .form-control-file {
    border: none;
  }
  
  /* Profile preview styling */
  .profile-preview {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    margin-top: 1rem;
  }
  
  /* Button styling */
  .btn-primary {
    background-color: #5a7dee;
    border-color: #5a7dee;
  }
  
  .btn-primary:hover {
    background-color: #4e6dd2;
  }
  
  /* Message styling */
  .error-message {
    color: red;
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }
  
  .update-message {
    color: green;
    text-align: center;
    font-size: 1rem;
    margin-top: 1rem;
  }
  </style>
  