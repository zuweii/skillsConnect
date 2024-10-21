<template>
    <div class="landing-page">
      <!-- Main Content -->
      <main class="main-content">
        <h2>My Classes</h2>
        <div class="class-view-mode">
          <button class="learner-button">Learner</button>
          <button class="teacher-button">Teacher</button>
        </div>
  
        <!-- Featured Classes -->
        <div class="featured-classes">
          <div
            v-for="classItem in featuredClasses"
            :key="classItem.id"
            class="featured-class"
          >
            <img :src="classItem.image" :alt="classItem.title" />
            <div class="class-info">
              <h3>{{ classItem.title }}</h3>
              <p>{{ classItem.instructor }}</p>
              <p>
                {{ classItem.date }} • {{ classItem.rating }} ({{
                  classItem.reviews
                }}
                reviews)
              </p>
            </div>
          </div>
        </div>
  
        <!-- Popular Classes -->
        <section class="popular-classes">
          <h3>Popular Classes</h3>
          <div class="class-list">
            <div
              v-for="classItem in popularClasses"
              :key="classItem.id"
              class="class-card"
            >
              <img :src="classItem.image" :alt="classItem.title" />
              <div class="class-info">
                <h4>{{ classItem.title }}</h4>
                <p>{{ classItem.instructor }}</p>
                <p>
                  {{ classItem.duration }} • {{ classItem.rating }} ({{
                    classItem.reviews
                  }}
                  reviews)
                </p>
              </div>
            </div>
          </div>
        </section>
  
        <!-- Classes Nearby -->
        <section class="nearby-classes">
          <h3>Classes Nearby</h3>
          <div class="class-grid">
            <!-- Placeholder cards for classes -->
            <div v-for="n in 6" :key="n" class="placeholder-card"></div>
          </div>
        </section>
  
        <!-- Recommended Classes -->
        <section class="recommended-classes">
          <h3>Recommended Classes</h3>
          <div class="class-grid">
            <!-- Placeholder cards for recommended classes -->
            <div v-for="n in 8" :key="n" class="placeholder-card"></div>
          </div>
        </section>
      </main>
    </div>
  </template>
  
  <script>
  import { db } from '../firebase/firebase_config';
  import StarRating from '../components/StarRating.vue';
  
  export default {
    data() {
      return {
        featuredClasses: [
          {
            id: 1,
            title:
              "Social Media Content Creation in Canva: From Beginner to Advanced",
            instructor: "Maggie Stara",
            date: "20 Oct 2024 3:30pm",
            rating: "4.7",
            reviews: 200,
            image: "path/to/image1.jpg",
          },
          {
            id: 2,
            title:
              "Hand Sewing Basics: Work Wonders with Fabric, Needle & Thread",
            instructor: "Bernadette Banner",
            date: "23 Oct 2024 12:30pm",
            rating: "4.8",
            reviews: 350,
            image: "path/to/image2.jpg",
          },
        ],
        popularClasses: [
          {
            id: 1,
            title: "Graphic Design Masterclass: Learn GREAT Design",
            instructor: "Lindsay Marsh",
            duration: "1h 55m",
            rating: "4.7",
            reviews: 1200,
            image: "path/to/image3.jpg",
          },
          {
            id: 2,
            title: "Video Editing with Adobe Premiere Pro For Beginners (2024)",
            instructor: "Jordy Vandeput",
            duration: "3h 44m",
            rating: "4.7",
            reviews: 200,
            image: "path/to/image4.jpg",
          },
          {
            id: 3,
            title:
              "Learn to Draw: A Comprehensive Introduction to Drawing Foundations & Style",
            instructor: "Mimi Chao",
            duration: "4h 22m",
            rating: "4.7",
            reviews: 240,
            image: "path/to/image5.jpg",
          },
        ],
      };
    },
  };
  </script>
  
  <style scoped>
  .landing-page {
    font-family: Arial, sans-serif;
  }
  
  .main-content {
    padding: 20px;
  }
  
  .class-view-mode {
    display: flex;
    justify-content: flex-start;
    margin-bottom: 20px;
  }
  
  .learner-button,
  .teacher-button {
    padding: 10px 20px;
    margin-right: 10px;
    background-color: #f0f0f0;
    border: none;
    border-radius: 4px;
  }
  
  .featured-classes,
  .popular-classes,
  .nearby-classes,
  .recommended-classes {
    margin-bottom: 30px;
  }
  
  .featured-class,
  .class-card {
    display: flex;
    margin-bottom: 15px;
  }
  
  .class-info h3,
  .class-info h4 {
    margin: 0;
  }
  
  .class-info p {
    margin: 5px 0;
  }
  
  .placeholder-card {
    width: 150px;
    height: 150px;
    background-color: #f0f0f0;
    margin-right: 10px;
  }
  </style>
  