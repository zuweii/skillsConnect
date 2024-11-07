<!-- EditProfileModal.vue -->
<template>
    <div class="modal-backdrop" @click.self="close">
      <div class="modal-content">
        <h2 class="text-center">Account Settings</h2>
        <form @submit.prevent="updateUserSettings">
          <!-- Profile Photo Upload -->
          <div class="form-group mt-4">
            <label for="profilePhoto" class="form-label">Profile Photo</label>
            <input type="file" id="profilePhoto" @change="handleFileUpload" class="form-control-file" />
            <img v-if="previewImage" :src="previewImage" alt="Profile Preview" class="profile-preview mt-3" />
          </div>
  
          <!-- Username Input -->
          <div class="form-group mt-4">
            <label for="username" class="form-label">Username</label>
            <input type="text" id="username" v-model="username" required class="form-control" />
            <p v-if="usernameError" class="error-message">{{ usernameError }}</p>
          </div>
  
          <!-- Save Button -->
          <button type="submit" class="btn btn-primary w-100 mt-4" :disabled="isLoading">
            {{ isLoading ? 'Updating...' : 'Save Changes' }}
          </button>
  
          <p v-if="updateMessage" class="update-message mt-3">{{ updateMessage }}</p>
        </form>
        <button @click="close" class="btn btn-secondary w-100 mt-3">Close</button>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { doc, getDoc, collection, query, where, updateDoc, getDocs } from 'firebase/firestore';
  import { db, storage } from '../firebase/firebase_config';
  import { getAuth } from 'firebase/auth';
  import { uploadBytes, getDownloadURL, ref as storageRef } from 'firebase/storage';
  
  export default {
    name: 'EditProfileModal',
    emits: ['close'],
    setup(_, { emit }) {
      const auth = getAuth();
      const user = auth.currentUser;
  
      const username = ref('');
      const profilePhoto = ref(null);
      const previewImage = ref(null);
      const usernameError = ref(null);
      const updateMessage = ref('');
      const isLoading = ref(false);
  
      const close = () => {
        emit('close');
      };
  
      const loadUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            username.value = userData.username || '';
            previewImage.value = userData.profile_photo || '';
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
        return querySnapshot.empty || querySnapshot.docs[0].id === user.uid;
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
        close,
      };
    },
  };
  </script>
  
  <style scoped>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: #ffffff;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 500px;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .profile-preview {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    margin-top: 1rem;
  }
  
  .btn-primary {
    background-color: #5a7dee;
    border-color: #5a7dee;
  }
  
  .btn-primary:hover {
    background-color: #4e6dd2;
  }
  
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
  