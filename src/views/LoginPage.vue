<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-container">
        <img src="../assets/logo.png" alt="SkillsConnect Logo" class="logo" />
      </div>
      <p class="login-instruction">Log in. Connect. Share your skills!</p>
      
      <!-- Google Login Button -->
      <button @click="handleGoogleLogin" class="btn btn-google btn-block">
        <i class="bi bi-google me-2"></i> Login with Google
      </button>
      
      <div class="divider">or</div>

      <form @submit.prevent="handleLogin">
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
        <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
      <p class="signup-link text-center mt-4">
        Don't have an account? <router-link to="/signup">Sign up</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, db } from "../firebase/firebase_config";
import { doc, getDoc, setDoc } from "firebase/firestore";
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

    return {
      email,
      password,
      showPassword,
      error,
      isLoading,
      handleLogin,
      handleGoogleLogin
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
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
}

.logo-container {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  max-width: 250px;
  height: auto;
}

.login-instruction {
  text-align: center;
  margin-bottom: 2rem;
  color: #666;
  font-size: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-control {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
}

.form-check {
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.btn-primary {
  background-color: #5a7dee;
  border-color: #5a7dee;
  padding: 0.7rem;
  font-size: 1.1rem;
}

.btn-block {
  display: block;
  width: 100%;
}

.btn-google {
  background-color: #5a7dee;
  border-color: #5a7dee;
  color: white;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.btn-google:hover {
  background-color: #4e6dd2;
  border-color: #4e6dd2;
}

.divider {
  text-align: center;
  font-size: 0.9rem;
  color: #666;
  margin: 1rem 0;
}

.error-message {
  color: red;
  text-align: center;
  margin-top: 1rem;
}
</style>
