import { createRouter, createWebHistory } from 'vue-router'
import { getAuth } from 'firebase/auth' 

// import views
import LoginPage from '../views/LoginPage.vue'
import ListClass from '../views/ListClass.vue'
import ClassDetails from '../views/ClassDetails.vue'

// Define the routes
const routes = [
  // Public route: Login page
  {
    path: '/login-page',
    name: 'LoginPage',
    component: LoginPage
  },
  // Private route: Requires authentication
  {
    path: '/list-class',
    name: 'ListClass',
    component: ListClass,
    meta: { requiresAuth: true }
  },
  // Private route: Requires authentication
  {
    path: '/class-details',
    name: 'ClassDetails',
    component: ClassDetails,
    meta: { requiresAuth: true }
  },
  // Catch-all route to redirect to login if not found
  {
    path: '/:catchAll(.*)',
    redirect: '/login-page'
  }
]

// Create the router
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to check for authentication before accessing routes
router.beforeEach(async (to, from, next) => {
  const auth = getAuth(); // Get the initialized Firebase Auth instance
  const user = auth.currentUser; // Check if the user is authenticated

  // Check if the route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (user) {
      // If the user is authenticated, allow access
      next();
    } else {
      // If the user is not authenticated, redirect to the login page
      next({ path: '/login-page' });
    }
  } else {
    // If the route does not require authentication, allow access
    next();
  }
})

export default router;
