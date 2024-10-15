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
        <button type="submit" class="btn btn-primary btn-block">Login</button>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import FBInstanceAuth from "../firebase/firebase_auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
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

    const handleLogin = async () => {
      error.value = null;

      try {
        const { data, errorCode } = await FBInstanceAuth.login(email.value, password.value);

        if (errorCode) {
          if (errorCode === "auth/user-not-found") {
            error.value = "Invalid email. Please check your email address.";
          } else if (errorCode === "auth/wrong-password") {
            error.value = "Wrong password. Please check your password.";
          } else if (errorCode === "auth/invalid-email") {
            error.value = "Invalid email format. Please enter a valid email address.";
          } else {
            error.value = "Login failed. Please try again.";
          }
          return;
        }

        const user = data.user;
        console.log("Login successful");

        // Check if user document exists in Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          // If user document doesn't exist, create it
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
          });
          console.log("New user document created in Firestore");
        } else {
          console.log("Existing user document found in Firestore");
        }

        // Check if there's a redirect query parameter (CHANGE TO HOMEPAGE PLEASE)
        const redirectPath = route.query.redirect || '/class-details';
        router.push(redirectPath);
      } catch (error) {
        console.error("Login failed:", error);
        error.value = "An unexpected error occurred. Please try again.";
      }
    };

    return {
      email,
      password,
      showPassword,
      error,
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
}

.login-card {
  background-color: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
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