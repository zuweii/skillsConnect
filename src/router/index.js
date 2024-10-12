// have to change this: routes that requires authentication and routes that doesn't require authentication

import { createRouter, createWebHistory } from 'vue-router'
// import views
import LoginPage from '../views/LoginPage.vue'
import ListClass from '../views/ListClass.vue'
import ClassDetails from '../views/ClassDetails.vue'


const routes = [
  // routes to the files
  {
    path: '/login-page',
    name: 'LoginPage',
    component: LoginPage
  },
  {
    path: '/list-class',
    name: 'ListClass',
    component: ListClass,
    meta: { requiresAuth: true }
  },
  {
    path: '/class-details',
    name: 'ClassDetails',
    component: ClassDetails,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})


export default router


// import { createRouter, createWebHistory } from 'vue-router'
// // import views
// import ListClass from '../views/ListClass.vue'
// import ClassDetails from '../views/ClassDetails.vue'
// import LandingPage from '../views/LandingPage.vue'
// import Login from '../views/Login.vue'

// // Mock authentication service
// const isAuthenticated = () => {
//   // Replace this with your real authentication check (e.g., checking token)
//   return !!localStorage.getItem('authToken');
// }

// const routes = [
//   // Route that doesn't require authentication (e.g., landing page, login)
//   {
//     path: '/',
//     name: 'LandingPage',
//     component: LandingPage
//   },
//   {
//     path: '/login',
//     name: 'Login',
//     component: Login
//   },

//   // Routes that require authentication
//   {
//     path: '/list-class',
//     name: 'ListClass',
//     component: ListClass,
//     meta: { requiresAuth: true }
//   },
//   {
//     path: '/class-details',
//     name: 'ClassDetails',
//     component: ClassDetails,
//     meta: { requiresAuth: true }
//   }
// ]

// const router = createRouter({
//   history: createWebHistory(),
//   routes
// })

// // Global navigation guard to check for authentication
// router.beforeEach((to, from, next) => {
//   // Check if the route requires authentication
//   if (to.matched.some(record => record.meta.requiresAuth)) {
//     // Check if the user is authenticated
//     if (!isAuthenticated()) {
//       // Redirect to the login page if not authenticated
//       next({ name: 'Login' });
//     } else {
//       // Proceed to the route if authenticated
//       next();
//     }
//   } else {
//     // Proceed to the route if no authentication is required
//     next();
//   }
// })

// export default router;
