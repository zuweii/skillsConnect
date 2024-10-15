import { createRouter, createWebHistory } from 'vue-router'
import FBInstanceAuth from '../firebase/firebase_auth'

// import views
import LoginPage from '../views/LoginPage.vue'
import ListClass from '../views/ListClass.vue'
import ClassDetails from '../views/ClassDetails.vue'
import Chat from '../views/Chat.vue';  // Import the Chat view

const routes = [
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
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat,  // Chat route
    meta: { requiresAuth: true }  // Require authentication for chat
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/login-page'
  }
];

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
      next({ path: '/login-page' });
    }
  } else {
    next();
  }
})

export default router;
