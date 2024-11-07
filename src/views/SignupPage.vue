<template>
  <div class="signup-container">
    <div class="signup-card">
      <div class="logo-container">
        <img src="../assets/logo.png" alt="SkillsConnect Logo" class="logo" />
      </div>
      <h1 class="signup-title">Create an Account</h1>
      <p class="signup-instruction">Join SkillsConnect and start sharing your expertise!</p>
      
      <form @submit.prevent="handleSignup" class="signup-form">
        <div class="form-row">
          <div class="form-group">
            <label for="username">Username <span class="text-danger">*</span></label>
            <input 
              type="text" 
              id="username" 
              v-model="username" 
              required 
              class="form-control" 
              autocomplete="username"
            />
          </div>
          <div class="form-group">
            <label for="email">Email <span class="text-danger">*</span></label>
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              required 
              class="form-control" 
              autocomplete="email"
            />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="password">Password <span class="text-danger">*</span></label>
            <div class="password-input">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="password" 
                v-model="password" 
                required 
                class="form-control" 
                autocomplete="new-password"
              />
              <button type="button" @click="togglePassword" class="password-toggle">
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirm Password <span class="text-danger">*</span></label>
            <div class="password-input">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="confirmPassword" 
                v-model="confirmPassword" 
                required 
                class="form-control" 
                autocomplete="new-password"
              />
              <button type="button" @click="togglePassword" class="password-toggle">
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="form-group profile-upload">
          <label for="profileImage">Profile Picture (Optional)</label>
          <div class="file-input-wrapper">
            <input 
              type="file" 
              id="profileImage" 
              @change="handleFileUpload" 
              accept="image/*" 
              class="file-input"
            />
            <div class="file-input-content">
              <i class="bi bi-cloud-upload"></i>
              <span>{{ profileImageName || 'Choose a file' }}</span>
            </div>
          </div>
        </div>

        <div>
          <span class="text-danger">*</span> <em class="text-secondary">Compulsory</em>
        </div>
        <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading || !isFormValid">
          {{ isLoading ? 'Creating Account...' : 'Sign Up' }}
        </button>
      </form>
      
      <p v-if="error" class="error-message">{{ error }}</p>
      
      <p class="login-link">
        Already have an account? <router-link to="/login">Log in here</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db, storage } from '../firebase/firebase_config';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export default {
  name: 'SignupPage',
  setup() {
    const router = useRouter();
    const auth = getAuth();

    const username = ref('');
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const showPassword = ref(false);
    const error = ref(null);
    const isLoading = ref(false);
    const profileImageFile = ref(null);
    const profileImageName = ref('');

    const isFormValid = computed(() => {
      return username.value.trim() !== '' &&
             email.value.trim() !== '' &&
             password.value.length >= 6 &&
             password.value === confirmPassword.value;
    });

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        profileImageFile.value = file;
        profileImageName.value = file.name;
      }
    };

    const togglePassword = () => {
      showPassword.value = !showPassword.value;
    };

    const saveUserData = async (uid, email, username, profilePhotoUrl) => {
      try {
        await setDoc(doc(db, 'users', uid), {
          email: email,
          username: username,
          profile_photo: profilePhotoUrl || '',
          upcoming_classes_as_student: [],
          upcoming_classes_as_teacher: [],
          posted_classes: [],
          finances: [],
          chats: [],
          teacher_average: 0,
          total_reviews: 0,
          portfolio: {
            youtube_links: [],
            project_images: [],
          },
          completed_classes: [],
          pending_reviews: [],
        }, { merge: true });
      } catch (error) {
        console.error('Error saving user data:', error);
        throw new Error('Failed to save user data');
      }
    };

    const handleSignup = async () => {
      error.value = null;
      isLoading.value = true;

      if (password.value !== confirmPassword.value) {
        error.value = "Passwords do not match.";
        isLoading.value = false;
        return;
      }

      try {
        // Step 1: Create user with email and password
        const { user } = await createUserWithEmailAndPassword(auth, email.value, password.value);

        // Step 2: Upload profile image to Firebase Storage if it exists
        let profileImageUrl = '';
        if (profileImageFile.value) {
          const storagePath = `profile-photos/${user.uid}`;
          const profileImageRef = storageRef(storage, storagePath);
          await uploadBytes(profileImageRef, profileImageFile.value);
          profileImageUrl = await getDownloadURL(profileImageRef);
        }

        // Step 3: Save user data in Firestore
        await saveUserData(user.uid, user.email, username.value, profileImageUrl);

        // Step 4: Redirect to the homepage after successful signup
        router.push('/home-page');
      } catch (err) {
        console.error('Signup failed:', err);
        error.value = handleSignupError(err.code);
      } finally {
        isLoading.value = false;
      }
    };

    const handleSignupError = (errorCode) => {
      switch (errorCode) {
        case 'auth/email-already-in-use':
          return 'Email is already in use. Please use a different email.';
        case 'auth/invalid-email':
          return 'Invalid email format. Please enter a valid email address.';
        case 'auth/weak-password':
          return 'Password is too weak. Please use a stronger password (at least 6 characters).';
        default:
          return 'Signup failed. Please try again.';
      }
    };

    return {
      username,
      email,
      password,
      confirmPassword,
      showPassword,
      error,
      isLoading,
      isFormValid,
      profileImageName,
      handleSignup,
      handleFileUpload,
      togglePassword,
    };
  },
};
</script>

<style scoped>
.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(to right, #adbef7, #5a7dee, #315cea, #2a4ec7);
  padding: 2rem;
}

.signup-card {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
}

.logo-container {
  text-align: center;
  margin-bottom: 1.5rem;
}

.logo {
  max-width: 200px;
  height: auto;
}

.signup-title {
  font-size: 1.75rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 0.5rem;
  color: #333;
}

.signup-instruction {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #666;
  font-size: 1rem;
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.form-group label {
  margin-bottom: 0.25rem;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  border-color: #5a7dee;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(90, 125, 238, 0.25);
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
}

.profile-upload {
  margin-top: 1rem;
}

.file-input-wrapper {
  position: relative;
  overflow: hidden;
  display: inline-block;
  width: 100%;
}

.file-input {
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
}

.file-input-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  border: 2px dashed #ced4da;
  border-radius: 6px;
  background-color: #f8f9fa;
  transition: background-color 0.15s ease-in-out;
  cursor: pointer;
}

.file-input-content:hover {
  background-color: #e9ecef;
}

.file-input-content i {
  font-size: 1.5rem;
  margin-right: 0.5rem;
  color: #5a7dee;
}

.btn-primary {
  background-color: #5a7dee;
  border-color: #5a7dee;
  color: white;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out;
  margin-top: 1rem;
}

.btn-primary:hover:not(:disabled) {
  background-color: #4e6dd2;
  border-color: #4e6dd2;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #6c757d;
}

.login-link a {
  color: #5a7dee;
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
}
</style>