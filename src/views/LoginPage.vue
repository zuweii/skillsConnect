<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-container">
        <img src="../assets/logo.png" alt="SkillsConnect Logo" class="logo">
      </div>
      <p class="login-instruction">Log in. Connect. Share your skills!</p>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <input 
            type="email" 
            v-model="email" 
            placeholder="Email" 
            required
            class="form-control"
          />
        </div>
        <div class="form-group">
          <input 
            :type="showPassword ? 'text' : 'password'" 
            v-model="password" 
            placeholder="Password" 
            required
            class="form-control"
          />
        </div>
        <div class="form-check">
          <input 
            type="checkbox" 
            id="showPassword" 
            v-model="showPassword" 
            class="form-check-input"
          />
          <label for="showPassword" class="form-check-label">Show Password</label>
        </div>
        <button type="submit" class="btn btn-primary btn-block">Login</button>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script>
import FBInstanceAuth from '../firebase/firebase_auth';
import { signInWithEmailAndPassword, getIdToken } from 'firebase/auth';



export default {
  name: 'LoginPage',
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      error: null
    };
  },
  methods: {
    async handleLogin() {
      const auth = FBInstanceAuth.getAuth();
      const router = this.$router;
      this.error = null;

      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;

        if (user) {
          console.log('Login successful');

          // Get and store user token
          const token = await getIdToken(user);
          localStorage.setItem('userToken', token);

          // Redirect to home page
          router.push('/class-details');  
        
        }
      } catch (error) {
        this.error = `Login failed: ${error.message}`;
      }
    }
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
  font-size: 1.0rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-control {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1.0rem;
}

.form-check {
  margin-bottom: 1.5rem;
  font-size: 1.0rem;
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
