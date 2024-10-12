<template>
  <div class="container mt-4">
    <h2 class="mb-4">List your own class</h2>
    <div class="row">
      <div class="col-md-4 mb-4">
        <div class="card shadow">
          <div class="card-body">
            <div class="photo-upload-area position-relative">
              <input type="file" id="photo-upload" @change="handleFileUpload" accept="image/*" class="d-none">
              <template v-if="!previewImage">
                <label for="photo-upload"
                  class="photo-upload-label d-flex flex-column align-items-center justify-content-center">
                  <i class="bi bi-image-fill fs-1"></i>
                  <span class="mt-2">Upload Photo</span>
                </label>
              </template>
              <template v-else>
                <img :src="previewImage" alt="Preview" class="img-fluid w-100 h-100 object-fit-cover">
                <button @click="removePhoto" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                  aria-label="Remove photo">
                  <i class="bi bi-x"></i>
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-8">
        <form @submit.prevent="submitForm">
          <div class="card shadow mb-3 p-2">
            <div class="card-body">
              <div class="mb-3">
                <label for="category" class="form-label fs-5"><b>Category</b></label>
                <select id="category" v-model="formData.mainCategory" @change="updateSubcategories"
                  class="form-select p-2 mb-2">
                  <option value="" disabled selected>Select a category</option>
                  <option v-for="category in categories" :key="category.name" :value="category.name">
                    {{ category.name }}
                  </option>
                </select>
                <select v-if="subcategories.length" v-model="formData.subcategory" class="form-select p-2">
                  <option value="" disabled selected>Select a subcategory</option>
                  <option v-for="subcategory in subcategories" :key="subcategory" :value="subcategory">
                    {{ subcategory }}
                  </option>
                </select>
              </div>
              <div v-if="formData.mainCategory && formData.subcategory" class="mb-3">
                Selected Category: {{ formData.mainCategory }} / {{ formData.subcategory }}
              </div>
            </div>
          </div>

          <div class="card shadow mb-3 p-2">
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label fs-5"><b>Class Information</b></label>
                <input type="text" id="classTitle" v-model="formData.classTitle" class="form-control p-2"
                  placeholder="Class Title">
              </div>
              <div class="mb-3">
                <input type="number" id="price" v-model="formData.price" class="form-control p-2" placeholder="Price">
              </div>
              <div class="row mb-3">
                <div class="col">
                  <input type="number" id="maxCapacity" v-model="formData.maxCapacity" class="form-control p-2"
                    placeholder="Max. Capacity of Class">
                </div>
                <div class="col">
                  <select id="skillLevel" v-model="formData.skillLevel" class="form-select">
                    <option value="" disabled selected>Skill Level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div class="row mb-3">
                <div class="col">
                  <input type="number" id="numberOfLessons" v-model="formData.numberOfLessons" class="form-control p-2"
                    placeholder="Number of Lessons">
                </div>
                <div class="col">
                  <select id="modeOfLesson" v-model="formData.modeOfLesson" class="form-select">
                    <option value="" disabled selected>Mode of Lesson</option>
                    <option value="online">Online</option>
                    <option value="in-person">Physical</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              <div class="mb-3">
                <input type="text" id="location" v-model="formData.location" class="form-control p-2"
                  placeholder="Location">
              </div>
              <div class="mb-3">
                <label class="form-label fs-5 mt-4"><b>Class Schedule</b></label>
                <div class="row">
                  <div class="col">
                    <label for="date" class="form-label">Start Date</label>
                    <input type="date" v-model="formData.date" class="form-control p-2 text-placeholder"
                      placeholder="DD/MM/YYYY" id="date">
                  </div>
                  <div class="col">
                    <label for="start_time" class="form-label">Start Time</label>
                    <input type="time" v-model="formData.startTime" class="form-control p-2 text-placeholder" id="start_time">
                  </div>
                  <div class="col">
                    <label for="end_time" class="form-label">End Time</label>
                    <input type="time" v-model="formData.endTimetime" class="form-control p-2 text-placeholder" id="end_time">
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <label for="additionalNotes" class="form-label">Additional Details</label>
                <input type="text" id="additionalNotes" v-model="formData.additionalNotes" class="form-control p-2"
                  placeholder="e.g. Class on every Thursday">
              </div>
              <div class="mb-3">
                <label class="form-label fs-5 mt-4"><b>Description</b></label>
                <textarea id="description" v-model="formData.description" class="form-control p-2" rows="5"></textarea>
              </div>
              <div class="text-end">
                <button type="submit" class="list btn btn-primary">List Class</button>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'ListClass',
    data() {
      return {
        formData: {
          mainCategory: '',
          subcategory: '',
          classTitle: '',
          price: null,
          maxCapacity: null,
          skillLevel: '',
          numberOfLessons: null,
          modeOfLesson: '',
          location: '',
          date: '',
          startTime: '',
          endTime: '',
          additionalNotes: '',
          description: ''
        },
        categories: [
          { name: 'Art', subcategories: ['Painting', 'Sculpture', 'Photography'] },
          { name: 'Music', subcategories: ['Guitar', 'Piano', 'Singing'] },
          { name: 'Cooking', subcategories: ['Baking', 'Grilling', 'Pastry'] },
          { name: 'Technology', subcategories: ['Web Development', 'Mobile Apps', 'Data Science'] },
          { name: 'Language', subcategories: ['English', 'Spanish', 'Mandarin'] },
        ],
        subcategories: [],
        previewImage: null
      }
    },
    methods: {
      updateSubcategories() {
        const selectedCategory = this.categories.find(cat => cat.name === this.formData.mainCategory);
        this.subcategories = selectedCategory ? selectedCategory.subcategories : [];
        this.formData.subcategory = ''; // Reset subcategory when main category changes
      },
      handleFileUpload(event) {
        const file = event.target.files[0]
        if (file) {
          this.previewImage = URL.createObjectURL(file)
        }
      },
      removePhoto() {
        this.previewImage = null
        const fileInput = document.getElementById('photo-upload')
        if (fileInput) {
          fileInput.value = ''
        }
      },
      submitForm() {
        // Handle form submission
        console.log(this.formData)
        console.log('Preview Image:', this.previewImage)
      }
    },
  // ADD THIS TO OMIT SEARCH BAR
  created() {
    this.$emit('update:showSearchBar', false)
  }
  }
</script>

<style scoped>
  .card {
    border-radius: 8px;
    border: 0.5px solid lightgray;
  }

  .photo-upload-area {
    border: 2px dashed #2240a4;
    border-radius: 5px;
    height: 300px;
    overflow: hidden;
  }

  .photo-upload-label {
    cursor: pointer;
    height: 100%;
    width: 100%;
    background-color: #eaeffd;
    color: #2240a4;
  }

  .object-fit-cover {
    object-fit: cover;
  }

  .list {
    background-color: #5a7dee;
  }

  .list:hover {
    background-color: #4e6dd2;
  }

  .form-control,
  .form-select {
    border-radius: 4px;
    border: 1.5px solid #ced4da;
  }
</style>