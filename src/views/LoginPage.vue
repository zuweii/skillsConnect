<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-container">
        <img src="../assets/logo.png" alt="SkillsConnect Logo" class="logo" />
      </div>
      
      <p class="login-instruction">Log in to connect and share your skills!</p>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" required class="form-control" />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-input">
            <input :type="showPassword ? 'text' : 'password'" id="password" v-model="password" required class="form-control" />
            <button type="button" @click="togglePassword" class="password-toggle">
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
          {{ isLoading ? 'Logging in...' : 'Log in' }}
        </button>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>

      <div class="divider">
        <span>or</span>
      </div>

      <!-- Google Sign-In Button -->
      <button @click="handleGoogleLogin" class="gsi-material-button">
        <div class="gsi-material-button-state"></div>
        <div class="gsi-material-button-content-wrapper">
          <div class="gsi-material-button-icon">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlns:xlink="http://www.w3.org/1999/xlink" style="display: block;">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
          </div>
          <span class="gsi-material-button-contents">Sign in with Google</span>
          <span style="display: none;">Sign in with Google</span>
        </div>
      </button>

      <p class="signup-link">
        Don't have an account? <router-link to="/signup">Sign up</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase_config";
import FBInstanceAuth from "../firebase/firebase_auth";

export default {
  name: "LoginPage",
  setup() {
    const router = useRouter();
    const route = useRoute();

    const email = ref("");
    const password = ref("");
    const showPassword = ref(false);
    const error = ref(null);
    const isLoading = ref(false);

    onMounted(async () => {
      if (!FBInstanceAuth.isAuthReady()) {
        await FBInstanceAuth.waitForAuthReady();
      }
      
      const currentUser = FBInstanceAuth.getCurrentUser();
      if (currentUser) {
        const redirectPath = route.query.redirect || '/home-page';
        router.push(redirectPath);
      }
    });

    const handleLogin = async () => {
      error.value = null;
      isLoading.value = true;

      try {
        const { user, error: loginError } = await FBInstanceAuth.login(email.value, password.value);

        if (loginError) {
          handleLoginError(loginError);
          return;
        }

        await ensureUserDocument(user);

        const redirectPath = route.query.redirect || '/home-page';
        router.push(redirectPath);
      } catch (err) {
        console.error("Login failed:", err);
        error.value = "An unexpected error occurred. Please try again.";
      } finally {
        isLoading.value = false;
      }
    };

    const handleLoginError = (errorCode) => {
      switch (errorCode) {
        case "auth/user-not-found":
          error.value = "Invalid email. Please check your email address.";
          break;
        case "auth/wrong-password":
          error.value = "Wrong password. Please check your password.";
          break;
        case "auth/invalid-email":
          error.value = "Invalid email format. Please enter a valid email address.";
          break;
        default:
          error.value = "Login failed. Please try again.";
      }
    };

    const ensureUserDocument = async (user) => {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      const defaultData = {
        email: user.email,
        username: userDoc.exists() && userDoc.data().username ? userDoc.data().username : user.email.split("@")[0],
        profile_photo: userDoc.exists() && userDoc.data().profile_photo 
          ? userDoc.data().profile_photo 
          : user.photoURL || "",
        upcoming_classes_as_student: userDoc.exists() && userDoc.data().upcoming_classes_as_student ? userDoc.data().upcoming_classes_as_student : [],
        upcoming_classes_as_teacher: userDoc.exists() && userDoc.data().upcoming_classes_as_teacher ? userDoc.data().upcoming_classes_as_teacher : [],
        posted_classes: userDoc.exists() && userDoc.data().posted_classes ? userDoc.data().posted_classes : [],
        finances: userDoc.exists() && userDoc.data().finances ? userDoc.data().finances : [],
        chats: userDoc.exists() && userDoc.data().chats ? userDoc.data().chats : [],
        teacher_average: userDoc.exists() && userDoc.data().teacher_average !== undefined ? userDoc.data().teacher_average : 0,
        total_reviews: userDoc.exists() && userDoc.data().total_reviews !== undefined ? userDoc.data().total_reviews : 0,
        portfolio: userDoc.exists() && userDoc.data().portfolio ? userDoc.data().portfolio : {
          youtube_links: [],
          project_images: []
        },
        completed_classes: userDoc.exists() && userDoc.data().completed_classes ? userDoc.data().completed_classes : [],
        pending_reviews: userDoc.exists() && userDoc.data().pending_reviews ? userDoc.data().pending_reviews : []
      };

      if (!userDoc.exists() || Object.keys(defaultData).some(key => !(key in userDoc.data()))) {
        await setDoc(userDocRef, defaultData, { merge: true });
      }
    };

    const handleGoogleLogin = async () => {
      error.value = null;
      isLoading.value = true;

      try {
        const result = await FBInstanceAuth.loginWithGoogle();
        const user = result.user;

        await ensureUserDocument(user);

        const redirectPath = route.query.redirect || '/home-page';
        router.push(redirectPath);
      } catch (err) {
        console.error("Google login failed:", err);
        error.value = "An unexpected error occurred with Google login. Please try again.";
      } finally {
        isLoading.value = false;
      }
    };

    const togglePassword = () => {
      showPassword.value = !showPassword.value;
    };

    return {
      email,
      password,
      showPassword,
      error,
      isLoading,
      handleLogin,
      handleGoogleLogin,
      togglePassword
    };
  }
};
</script>

<style scoped>
.login-container {
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

.login-card {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
}

.logo-container {
  text-align: center;
  margin-bottom: 1.5rem;
}

.logo {
  max-width: 200px;
  height: auto;
}

.login-title {
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 0.5rem;
  color: #333;
}

.login-instruction {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #666;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
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

.btn-primary {
  background-color: #5a7dee;
  border-color: #5a7dee;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out;
}

.btn-primary:hover, .btn-primary:focus {
  background-color: #4e6dd2;
  border-color: #4e6dd2;
}

.btn-block {
  display: block;
  width: 100%;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #ced4da;
}

.divider span {
  padding: 0 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.error-message {
  color: #dc3545;
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.signup-link {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #6c757d;
}

.signup-link a {
  color: #5a7dee;
  text-decoration: none;
  font-weight: 500;
}

.signup-link a:hover {
  text-decoration: underline;
}

/* Google Sign-In Button Styles */
.gsi-material-button {
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  -webkit-appearance: none;
  background-color: WHITE;
  background-image: none;
  border: 1px solid #747775;
  -webkit-border-radius: 4px;
  border-radius: 4px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  color: #1f1f1f;
  cursor: pointer;
  font-family: 'Roboto', arial, sans-serif;
  font-size: 14px;
  height: 40px;
  letter-spacing: 0.25px;
  outline: none;
  overflow: hidden;
  padding: 0 12px;
  position: relative;
  text-align: center;
  -webkit-transition: background-color .218s, border-color .218s, box-shadow .218s;
  transition: background-color .218s, border-color .218s, box-shadow .218s;
  vertical-align: middle;
  white-space: nowrap;
  width: 100%;
  max-width: 400px;
  min-width: min-content;
  margin-top: 1rem;
}

.gsi-material-button .gsi-material-button-icon {
  height: 20px;
  margin-right: 12px;
  min-width: 20px;
  width: 20px;
}

.gsi-material-button .gsi-material-button-content-wrapper {
  -webkit-align-items: center;
  align-items: center;
  display: flex;
  -webkit-flex-direction: row;
  flex-direction: row;
  -webkit-flex-wrap: nowrap;
  flex-wrap: nowrap;
  height: 100%;
  justify-content: space-between;
  position: relative;
  width: 100%;
}

.gsi-material-button .gsi-material-button-contents {
  -webkit-flex-grow: 1;
  flex-grow: 1;
  font-family: 'Roboto', arial, sans-serif;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: top;
}

.gsi-material-button .gsi-material-button-state {
  -webkit-transition: opacity .218s;
  transition: opacity .218s;
  bottom: 0;
  left: 0;
  opacity: 0;
  position: absolute;
  right: 0;
  top: 0;
}

.gsi-material-button:disabled {
  cursor: default;
  background-color: #ffffff61;
  border-color: #1f1f1f1f;
}

.gsi-material-button:disabled .gsi-material-button-contents {
  opacity: 38%;
}

.gsi-material-button:disabled .gsi-material-button-icon {
  opacity: 38%;
}

.gsi-material-button:not(:disabled):active .gsi-material-button-state, 
.gsi-material-button:not(:disabled):focus .gsi-material-button-state {
  background-color: #303030;
  opacity: 12%;
}

.gsi-material-button:not(:disabled):hover {
  -webkit-box-shadow: 0 1px 2px 0 rgba(60, 64, 67, .30), 0 1px 3px 1px rgba(60, 64, 67, .15);
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, .30), 0 1px 3px 1px rgba(60, 64, 67, .15);
}

.gsi-material-button:not(:disabled):hover .gsi-material-button-state {
  background-color: #303030;
  opacity: 8%;
}
</style>