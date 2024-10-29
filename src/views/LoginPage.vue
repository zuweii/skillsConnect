<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-container">
        <img src="../assets/logo.png" alt="SkillsConnect Logo" class="logo" />
      </div>
      <p class="login-instruction">Log in. Connect. Share your skills!</p>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <input type="email" v-model="email" placeholder="Email" required class="form-control" />
        </div>
        <div class="form-group">
          <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Password" required
            class="form-control" />
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
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import FBInstanceAuth from "../firebase/firebase_auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase_config";

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
        const redirectPath = route.query.redirect || '/';
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

        const redirectPath = route.query.redirect || '/';
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
      await setDoc(userDocRef, {
        email: user.email,
        username: user.email.split("@")[0],
        profile_photo: "",
        upcoming_classes_as_student: [],
        upcoming_classes_as_teacher: [],
        posted_classes: [],
        finances: [],
        chats: [],
        portfolio: {
          youtube_links: [],
          project_images: []
        },
        completed_classes: [],
        pending_reviews: []
      }, { merge: true });
    };

    return {
      email,
      password,
      showPassword,
      error,
      isLoading,
      handleLogin
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
  overflow: hidden; /* Prevent scrolling */
  position: fixed; /* Fix the container to viewport */
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
  max-height: 90vh; /* Limit height to prevent overflow */
  overflow-y: auto; /* Allow scrolling within the card if content is too long */
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

.error-message {
  color: red;
  text-align: center;
  margin-top: 1rem;
}
</style>