<template>
  <div class="container mt-4">
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a class="text-decoration-none text-secondary" href='#'>{{ classData.category }}</a></li>
        <li class="breadcrumb-item active" aria-current="page"><a class="text-decoration-none text-dark" href='#'>{{ classData.subcategory }}</a></li>
      </ol>
    </nav>

    <div class="row">
      <div class="col-md-6 mb-4">
        <div class="class-image-container">
          <img :src="classData.img" :alt="classData.title" class="class-image">
        </div>
      </div>
      <div class="col-md-6">
        <h1 class="h2 mb-3">{{ classData.title }}</h1>
        <div class="d-flex align-items-center mb-2">
          <span class="me-2">{{ classData.rating.toFixed(1) }}</span>
          <StarRating :rating="classData.rating" />
          <span class="text-muted ms-2">({{ classData.reviews }} Reviews)</span>
          <span class="ms-3 text-colour">Available: {{ classData.availability }}</span>
        </div>
        <h2 class="h3 mb-3">${{ classData.price.toFixed(2) }}</h2>
        <p class="mb-4">{{ classData.description }}</p>
        <button class="enrol btn btn-primary btn-lg w-100 text-white align-bottom">Enrol Now</button>
      </div>
    </div>

   <div class="card mt-4 p-2 shadow">
  <div class="card-body">
    <h3 class="card-title mb-4">
      Class Details
    </h3>
    <div class="row mt-3">
      <div class="col-md">
        <p class="text-colour"><strong>Class Schedule:</strong></p>
        <p>
            {{ classData.details.schedule }}
            <br>
            {{ classData.details.time }}
            <br>
            {{ classData.details.additonalInfo }}
        </p>
      </div>
      <div class="col-md">
        <p class="text-colour"><strong>Number of Lessons:</strong></p>
        <p>{{ classData.details.numberOfLessons }}</p>
      </div>
      <div class="col-md">
        <p class="text-colour"><strong>Mode of Lessons:</strong></p>
        <p>{{ classData.details.modeOfLessons }}</p>
      </div>
      <div class="col-md">
        <p class="text-colour"><strong>Skill Level:</strong></p>
        <p>{{ classData.details.skillLevel }}</p>
      </div>
      <div class="col-md">
        <p class="text-colour"><strong>Location:</strong></p>
        <p>{{ classData.details.location }}</p>
      </div>
    </div>
  </div>
</div>

    <div class="card mt-4 p-2 shadow">
      <div class="card-body">
        <h3 class="card-title mb-4">
          Meet the Instructor
        </h3>
        <div class="row mt-3">
          <div class="col-md-4">
            <div class="d-flex flex-column align-items-center">
              <div class="instructor-image-container mb-3">
                <img :src="classData.instructor.image" :alt="classData.instructor.name" class="instructor-image">
              </div>
              <h4 class="h5 mb-1">{{ classData.instructor.name }}</h4>
              <div class="d-flex align-items-center">
                <span class="me-2">{{ classData.instructor.rating.toFixed(1) }}</span>
                <StarRating :rating="classData.instructor.rating" />
                <span class="ms-2 text-muted">({{ classData.instructor.reviews }} Reviews)</span>
              </div>
            </div>
          </div>
          <div class="col-md-8">
            <div v-for="(review, index) in reviews" :key="index" class="card mb-3 shadow-sm" style="border:1px solid lightgray">
              <div class="card-body">
                <h5 class="card-title">{{ review.name }}</h5>
                <div class="d-flex align-items-center mb-2">
                  <StarRating :rating="review.rating" />
                  <small class="text-muted ms-2">{{ review.date }}</small>
                </div>
                <p class="card-text">{{ review.comment }}</p>
              </div>
            </div>
            <a href="#" class="text-decoration-none text-colour">Read all reviews »</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StarRating from '../components/StarRating.vue'

export default {
  name: 'ClassDetails',
  components: {
    StarRating
  },
  data() {
    return {
      classData: {
        category: 'Baking',
        subcategory: 'Bread',
        img: '/images/bread.png', // This will be replaced with backend URL
        title: 'Sourdough Bread Baking Class',
        rating: 4.0,
        reviews: 10,
        availability: '5/10',
        price: 120.00,
        description: 'Learn the basics of sourdough bread baking in this hands-on class! Discover how to make your own starter, mix and shape dough, and bake a perfect loaf with a crispy crust and soft, airy crumb. Ideal for beginners and home bakers looking to master traditional sourdough techniques.',
        details: {
          schedule: '10 Nov 2024',
          time: '1pm - 6pm',
          additonalInfo: '',
          numberOfLessons: 1,
          modeOfLessons: 'Physical',
          skillLevel: 'Beginner',
          location: 'RedHill Blk 123'
        },
        instructor: {
          name: 'Matilda Leow',
          rating: 4.2,
          reviews: 15,
          image: '/images/instructor.jpg' // This will be replaced with backend URL
        }
      },
      reviews: [
        {
          name: 'Sabrina Carpenter',
          rating: 5.0,
          date: '1 month ago',
          comment: 'Awesome instructor! She was very patient and had great teaching techniques for sourdough!'
        },
        {
          name: 'Joseph',
          rating: 4.0,
          date: '2 month ago',
          comment: 'She was very patient when teaching us. I was able to learn a lot from her classes!'
        }
      ]
    }
  },
  methods: {
    formatLabel(key) {
      return key.split(/(?=[A-Z])/).join(' ')
    }
  },
  // ADD THIS FOR SEARCH BAR 
  created() {
    this.$emit('update:showSearchBar', true)
  },
  beforeDestroy() {
    this.$emit('update:showSearchBar', false)
  }
}
</script>

<style scoped>
.class-image-container {
  width: 100%;
  height: 400px;
  overflow: hidden;
}

.class-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.instructor-image-container {
  width: 150px;
  height: 150px;
  overflow: hidden;
  border-radius: 50%;
}

.instructor-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.text-colour {
  color: #2240a4;
}
.enrol {
  background-color: #5a7dee;
}
.enrol:hover {
  background-color: #4e6dd2;
}
.card {
  border: 0;
}
</style>

