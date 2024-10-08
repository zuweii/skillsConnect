import { createRouter, createWebHistory } from 'vue-router'
// import views
import ListClass from '../views/ListClass.vue'

const routes = [
// routes to the files
  {
    path: '/list-class',
    name: 'ListClass',
    component: ListClass
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router