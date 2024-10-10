import { createRouter, createWebHistory } from 'vue-router'
// import views
import ListClass from '../views/ListClass.vue'
import ClassDetails from '../views/ClassDetails.vue'

const routes = [
// routes to the files
  {
    path: '/list-class',
    name: 'ListClass',
    component: ListClass
  },
  {
    path: '/class-details',
    name: 'ClassDetails',
    component: ClassDetails
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router