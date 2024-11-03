import { createRouter, createWebHistory } from 'vue-router'
import FBInstanceAuth from '../firebase/firebase_auth'

// import views
import LoginPage from '../views/LoginPage.vue'
import ListClass from '../views/ListClass.vue'
import ClassDetails from '../views/ClassDetails.vue'
import Payment from '../views/Payment.vue'
import LandingPage from '../views/LandingPage.vue'
import HomePage from '../views/HomePage.vue'
import ProfilePage from '../views/ProfilePage.vue'
import ReviewsPage from '../views/ReviewsPage.vue'
import SignupPage from '../views/SignupPage.vue'

const routes = [
  {
    path: '/login-page',
    name: 'LoginPage',
    component: LoginPage
  },
  {
    path: '/',
    name:'LandingPage',
    component: LandingPage
  },
  {
    path: '/home-page',
    name: 'HomePage',
    component: HomePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/list-class',
    name: 'ListClass',
    component: ListClass,
    meta: { requiresAuth: true }
  },
  {
    path: '/class-details/:id',
    name: 'ClassDetails',
    component: ClassDetails,
  },
  {
    path: '/payment/:classId',
    name: 'Payment',
    component: Payment,
    meta: { requiresAuth: true }
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/login-page'
  },
  {
    path: '/profile-page',
    name: 'ProfilePage',
    component: ProfilePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/reviews-page/:classId',
    name: 'ReviewsPage',
    component: ReviewsPage,
    props: true,
    component: ReviewsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/signup',
    name: 'SignupPage',
    component: SignupPage,
  }
]

// Create the router
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to check for authentication before accessing routes
router.beforeEach(async (to, from, next) => {
  await FBInstanceAuth.waitForAuthReady();
  const user = FBInstanceAuth.getCurrentUser();

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (user) {
      next();
    } else {
      next({
        path: '/login-page',
        query: { redirect: to.fullPath }
      });
    }
  } else {
    next();
  }
})

export default router;