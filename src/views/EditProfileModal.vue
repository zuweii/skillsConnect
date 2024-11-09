<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">Account Settings</h2>
        <button @click="close" class="close-button">&times;</button>
      </div>
      <form @submit.prevent="updateUserSettings">
        <div class="form-group">
          <label for="profilePhoto" class="form-label">Profile Photo</label>
          <div class="profile-photo-container">
            <img :src="previewImage || '/placeholder.svg?height=150&width=150'" alt="Profile Preview" class="profile-preview" />
            <div class="profile-photo-overlay">
              <label for="profilePhoto" class="upload-button text-center">
                <i class="bi bi-camera"></i>
                Change Photo
              </label>
            </div>
          </div>
          <input type="file" id="profilePhoto" @change="handleFileUpload" class="form-control-file" accept="image/*" />
        </div>

        <div class="form-group">
          <label for="username" class="form-label">Username</label>
          <input type="text" id="username" v-model="username" required class="form-control" placeholder="Enter your username" />
          <p v-if="usernameError" class="error-message">
            <i class="bi bi-exclamation-circle"></i> {{ usernameError }}
          </p>
        </div>

        <button type="submit" class="btn btn-primary w-100" :disabled="isLoading">
          <i class="bi" :class="isLoading ? 'bi-hourglass-split' : 'bi-check-circle'"></i>
          {{ isLoading ? 'Updating...' : 'Save Changes' }}
        </button>

        <p v-if="updateMessage" :class="['update-message', updateMessage.includes('Error') ? 'error' : 'success']">
          <i :class="updateMessage.includes('Error') ? 'bi bi-x-circle' : 'bi bi-check-circle'"></i>
          {{ updateMessage }}
        </p>
      </form>
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
  emits: ['close', 'update'],
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
        emit('update', { username: username.value, profile_photo: profilePhotoUrl });
        
        // Auto-close the modal after 1.5 seconds
        setTimeout(() => {
          close();
        }, 1500);
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
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 500px;
  overflow: hidden;
}

.modal-header {
  background-color: #5a7dee;
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.close-button:hover {
  opacity: 0.7;
}

form {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.profile-photo-container {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto;
  border-radius: 50%;
  overflow: hidden;
}

.profile-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.profile-photo-container:hover .profile-photo-overlay {
  opacity: 1;
}

.upload-button {
  color: lightgray;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s, color 0.2s;
}

.upload-button:hover {
  color: white;
}

.form-control-file {
  display: none;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-control:focus {
  border-color: #5a7dee;
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(90, 125, 238, 0.25);
}

.btn-primary {
  background-color: #5a7dee;
  border-color: #5a7dee;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #4e6dd2;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
}

.error-message i {
  margin-right: 0.25rem;
}

.update-message {
  text-align: center;
  font-size: 1rem;
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.update-message i {
  margin-right: 0.5rem;
}

.update-message.success {
  background-color: #d4edda;
  color: #155724;
}

.update-message.error {
  background-color: #f8d7da;
  color: #721c24;
}
</style>