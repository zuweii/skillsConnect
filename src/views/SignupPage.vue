<template>
  <div class="signup-container">
    <div class="signup-card">
      <div class="logo-container">
        <img src="../assets/logo.png" alt="SkillsConnect Logo" class="logo" />
      </div>
      <p class="signup-instruction">Create an Account and Start Sharing Your Skills!</p>
      <form @submit.prevent="handleSignup">
        <div class="form-group">
          <input type="text" v-model="username" placeholder="Username" required class="form-control" autocomplete="off" />
        </div>
        <div class="form-group">
          <input type="email" v-model="email" placeholder="Email" required class="form-control" />
        </div>
        <div class="form-group">
          <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Password" required class="form-control" />
        </div>
        <div class="form-check">
          <input type="checkbox" id="showPassword" v-model="showPassword" class="form-check-input" />
          <label for="showPassword" class="form-check-label">Show Password</label>
        </div>
        <div class="form-group">
          <input type="file" @change="handleFileUpload" accept="image/*" class="form-control" />
        </div>
        <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
          {{ isLoading ? 'Creating Account...' : 'Sign Up' }}
        </button>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
      <p class="login-link">
        Already have an account? <router-link to="/login">Log in here</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
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
    const showPassword = ref(false);
    const error = ref(null);
    const isLoading = ref(false);
    const profileImageFile = ref(null);

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        profileImageFile.value = file;
      }
    };

    const saveUserData = async (uid, email, username, profilePhotoUrl) => {
      try {
        await setDoc(doc(db, 'users', uid), {
          email: email,
          username: username || email.split('@')[0],
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
          return 'Password is too weak. Please use a stronger password.';
        default:
          return 'Signup failed. Please try again.';
      }
    };

    return {
      username,
      email,
      password,
      showPassword,
      error,
      isLoading,
      handleSignup,
      handleFileUpload,
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
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.signup-card {
  background-color: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1.5rem;
  width: 100%;
}

.form-control {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
}

.btn-primary {
  background-color: #5a7dee;
  border-color: #5a7dee;
  padding: 0.7rem;
  font-size: 1.1rem;
  width: 100%;
  display: block;
}

.logo-container {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  max-width: 250px;
  height: auto;
}

.signup-instruction {
  text-align: center;
  margin-bottom: 2rem;
  color: #666;
  font-size: 1rem;
}

.form-check {
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.error-message {
  color: red;
  text-align: center;
  margin-top: 1rem;
}

.login-link {
  text-align: center;
  margin-top: 1.5rem;
}
</style>
