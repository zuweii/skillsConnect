<template>
  <div class="container mt-4">
    <h1 class="mb-4">List your own class</h1>
    <div class="row">
      <div class="col-md-4 mb-4">
        <div class="photo-upload-area">
          <input type="file" id="photo-upload" @change="handleFileUpload" accept="image/*" class="d-none">
          <label for="photo-upload" class="photo-upload-label d-flex flex-column align-items-center justify-content-center">
            <i class="bi bi-image fs-1"></i>
            <span class="mt-2">Upload Photo</span>
          </label>
          <img v-if="previewImage" :src="previewImage" alt="Preview" class="img-fluid mt-3">
        </div>
      </div>
      <div class="col-md-8">
        <form @submit.prevent="submitForm">
          <div class="mb-3">
            <label for="category" class="form-label">Category</label>
            <select id="category" v-model="formData.category" class="form-select">
              <option value="">Select a category</option>
              <!-- Add category options here -->
            </select>
          </div>
          <div class="mb-3">
            <label for="classTitle" class="form-label">Class Title</label>
            <input type="text" id="classTitle" v-model="formData.classTitle" class="form-control">
          </div>
          <div class="mb-3">
            <label for="price" class="form-label">Price</label>
            <input type="number" id="price" v-model="formData.price" class="form-control">
          </div>
          <div class="row mb-3">
            <div class="col">
              <label for="maxCapacity" class="form-label">Max. Capacity of Class</label>
              <input type="number" id="maxCapacity" v-model="formData.maxCapacity" class="form-control">
            </div>
            <div class="col">
              <label for="skillLevel" class="form-label">Skill Level</label>
              <select id="skillLevel" v-model="formData.skillLevel" class="form-select">
                <option value="">Select skill level</option>
                <!-- Add skill level options here -->
              </select>
            </div>
          </div>
          <div class="row mb-3">
            <div class="col">
              <label for="numberOfLessons" class="form-label">Number of Lessons</label>
              <input type="number" id="numberOfLessons" v-model="formData.numberOfLessons" class="form-control">
            </div>
            <div class="col">
              <label for="modeOfLesson" class="form-label">Mode of Lesson</label>
              <select id="modeOfLesson" v-model="formData.modeOfLesson" class="form-select">
                <option value="">Select mode of lesson</option>
                <!-- Add mode of lesson options here -->
              </select>
            </div>
          </div>
          <div class="mb-3">
            <label for="location" class="form-label">Location</label>
            <input type="text" id="location" v-model="formData.location" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">Class Schedule</label>
            <div class="row">
              <div class="col">
                <input type="date" v-model="formData.date" class="form-control">
              </div>
              <div class="col">
                <input type="time" v-model="formData.time" class="form-control">
              </div>
            </div>
          </div>
          <div class="mb-3">
            <label for="additionalNotes" class="form-label">Additional Notes</label>
            <input type="text" id="additionalNotes" v-model="formData.additionalNotes" class="form-control" placeholder="e.g. Class on every Thursday">
          </div>
          <div class="mb-3">
            <label for="description" class="form-label">Description</label>
            <textarea id="description" v-model="formData.description" class="form-control" rows="5"></textarea>
          </div>
          <button type="submit" class="btn btn-primary">List Class</button>
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
        category: '',
        classTitle: '',
        price: null,
        maxCapacity: null,
        skillLevel: '',
        numberOfLessons: null,
        modeOfLesson: '',
        location: '',
        date: '',
        time: '',
        additionalNotes: '',
        description: ''
      },
      previewImage: null
    }
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0]
      if (file) {
        this.previewImage = URL.createObjectURL(file)
      }
    },
    submitForm() {
      // Handle form submission
      console.log(this.formData)
    }
  }
}
</script>

<style scoped>
.photo-upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
}

.photo-upload-label {
  height: 200px;
  background-color: #f8f9fa;
  border-radius: 8px;
}
</style>