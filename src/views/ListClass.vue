<template>
  <div class="container mt-4">
    <h2 class="mb-4">{{ isEditMode ? 'Edit Class Listing' : 'List Your Own Class' }}</h2>
    <div v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>
    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-else class="row">
      <div class="col-md-4 mb-4">
        <div class="card shadow">
          <div class="card-body">
            <div class="photo-upload-area position-relative">
              <input type="file" id="photo-upload" @change="handleFileUpload" accept="image/*" class="d-none">
              <template v-if="!previewImage">
                <label for="photo-upload" class="photo-upload-label d-flex flex-column align-items-center justify-content-center">
                  <i class="bi bi-image-fill fs-1"></i>
                  <span class="mt-2">Upload Photo</span>
                </label>
              </template>
              <template v-else>
                <img :src="previewImage" alt="Preview" class="img-fluid w-100 h-100 object-fit-cover">
                <button @click="removePhoto" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2" aria-label="Remove photo">
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
                <select id="category" v-model="formData.mainCategory" @change="updateSubcategories" class="form-select p-2 mb-2">
                  <option value="" disabled>Select a category</option>
                  <option v-for="category in categories" :key="category.category_name" :value="category.category_name">
                    {{ category.category_name }}
                  </option>
                </select>
                <select v-if="subcategories.length > 0" v-model="formData.subcategory" class="form-select p-2">
                  <option value="" disabled>Select a subcategory</option>
                  <option v-for="subcategory in subcategories" :key="subcategory" :value="subcategory">
                    {{ subcategory }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="card shadow mb-3 p-2">
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label fs-5"><b>Class Information</b></label>
                <input type="text" id="classTitle" v-model="formData.classTitle" class="form-control p-2" placeholder="Class Title">
              </div>
              <div class="mb-3">
                <input type="number" id="price" v-model="formData.price" class="form-control p-2" placeholder="Price">
              </div>
              <div class="row mb-3">
                <div class="col">
                  <input type="number" id="maxCapacity" v-model="formData.maxCapacity" class="form-control p-2" placeholder="Max. Capacity of Class">
                </div>
                <div class="col">
                  <select id="skillLevel" v-model="formData.skillLevel" class="form-select">
                    <option value="" disabled>Skill Level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div class="row mb-3">
                <div class="col">
                  <input type="number" id="numberOfLessons" v-model="formData.numberOfLessons" class="form-control p-2" placeholder="Number of Lessons">
                </div>
                <div class="col">
                  <select id="modeOfLesson" v-model="formData.modeOfLesson" class="form-select">
                    <option value="" disabled>Mode of Lesson</option>
                    <option value="online">Online</option>
                    <option value="physical">Physical</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              <div class="mb-3">
                <input type="text" id="location" v-model="formData.location" class="form-control p-2" placeholder="Location">
              </div>
              <div class="mb-3">
                <label class="form-label fs-5 mt-4"><b>Class Schedule</b></label>
                <div class="row">
                  <div class="col">
                    <label for="date" class="form-label">Start Date</label>
                    <input type="date" v-model="formData.date" class="form-control p-2" id="date">
                  </div>
                  <div class="col">
                    <label for="start_time" class="form-label">Start Time</label>
                    <input type="time" v-model="formData.startTime" class="form-control p-2" id="start_time">
                  </div>
                  <div class="col">
                    <label for="end_time" class="form-label">End Time</label>
                    <input type="time" v-model="formData.endTime" class="form-control p-2" id="end_time">
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <label for="additionalNotes" class="form-label">Additional Details</label>
                <input type="text" id="additionalNotes" v-model="formData.additionalNotes" class="form-control p-2" placeholder="e.g. Classes on every Thursday">
              </div>
              <div class="mb-3">
                <label class="form-label fs-5 mt-4"><b>Description</b></label>
                <textarea id="description" v-model="formData.description" class="form-control p-2" rows="5"></textarea>
              </div>
              <div class="text-end">
                <button type="submit" class="list btn btn-primary" :disabled="!isFormValid">{{ isEditMode ? 'Update Class' : 'List Class' }}</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, updateDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import { db, storage, auth } from '../firebase/firebase_config';

export default {
  name: 'ListClass',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const classId = route.params.classId;
    const isEditMode = ref(Boolean(classId));

    const formData = ref({
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
    });

    const categories = ref([]);
    const subcategories = ref([]);
    const previewImage = ref(null);
    const imageFile = ref(null);
    const error = ref(null);
    const loading = ref(true);

    const isFormValid = computed(() => {
      return formData.value.mainCategory &&
        formData.value.subcategory &&
        formData.value.classTitle &&
        formData.value.price &&
        formData.value.maxCapacity &&
        formData.value.skillLevel &&
        formData.value.numberOfLessons &&
        formData.value.modeOfLesson &&
        formData.value.location &&
        formData.value.date &&
        formData.value.startTime &&
        formData.value.endTime &&
        formData.value.description &&
        (imageFile.value || previewImage.value);
    });

    const fetchCategories = async () => {
      try {
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        categories.value = categoriesSnapshot.docs.map(doc => ({
          category_name: doc.id,
          ...doc.data()
        }));
      } catch (err) {
        error.value = 'Failed to load categories. Please try again later.';
      }
    };

    const updateSubcategories = () => {
      const selectedCategory = categories.value.find(cat => cat.category_name === formData.value.mainCategory);
      subcategories.value = selectedCategory ? selectedCategory.sub_categories : [];
      formData.value.subcategory = '';
    };

    const populateFormData = async () => {
      if (!classId) return;

      try {
        const classDoc = await getDoc(doc(db, 'classes', classId));
        if (classDoc.exists()) {
          const data = classDoc.data();
          formData.value = {
            mainCategory: data.category,
            subcategory: data.subcategory,
            classTitle: data.title,
            price: data.price,
            maxCapacity: data.max_capacity,
            skillLevel: data.skill_level,
            numberOfLessons: data.number_of_lessons,
            modeOfLesson: data.mode,
            location: data.location,
            date: data.start_date.toDate().toISOString().split('T')[0],
            startTime: data.start_time.toDate().toTimeString().slice(0, 5),
            endTime: data.end_time.toDate().toTimeString().slice(0, 5),
            additionalNotes: data.schedule,
            description: data.description
          };
          previewImage.value = data.image;
        }
      } catch (err) {
        error.value = 'Failed to load class details. Please try again later.';
      }
    };

    onMounted(async () => {
      loading.value = true;
      await fetchCategories();
      if (isEditMode.value) await populateFormData();
      loading.value = false;
    });

    const submitForm = async () => {
      if (!isFormValid.value) {
        alert('Please fill in all required fields and upload an image.');
        return;
      }

      try {
        let imageUrl = previewImage.value;
        if (imageFile.value) {
          const imageRef = storageRef(storage, `class-images/${Date.now()}_${imageFile.value.name}`);
          await uploadBytes(imageRef, imageFile.value);
          imageUrl = await getDownloadURL(imageRef);
        }

        const classData = {
          category: formData.value.mainCategory,
          subcategory: formData.value.subcategory,
          title: formData.value.classTitle,
          price: parseFloat(formData.value.price),
          max_capacity: parseInt(formData.value.maxCapacity),
          skill_level: formData.value.skillLevel,
          number_of_lessons: parseInt(formData.value.numberOfLessons),
          mode: formData.value.modeOfLesson,
          location: formData.value.location,
          start_date: new Date(formData.value.date),
          start_time: new Date(`${formData.value.date}T${formData.value.startTime}`),
          end_time: new Date(`${formData.value.date}T${formData.value.endTime}`),
          schedule: formData.value.additionalNotes,
          description: formData.value.description,
          image: imageUrl
        };

        if (isEditMode.value) {
          await updateDoc(doc(db, 'classes', classId), classData);
        } else {
          await addDoc(collection(db, 'classes'), classData);
        }

        router.push('/profile');
      } catch (err) {
        error.value = 'An error occurred while listing the class. Please try again.';
      }
    };

    return {
      formData,
      categories,
      subcategories,
      previewImage,
      imageFile,
      error,
      loading,
      isFormValid,
      isEditMode,
      handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
          previewImage.value = URL.createObjectURL(file);
          imageFile.value = file;
        }
      },
      removePhoto() {
        previewImage.value = null;
        imageFile.value = null;
      },
      updateSubcategories,
      submitForm
    };
  }
};
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

.list:disabled {
  background-color: #b0b0b0;
  border: 1px solid #b0b0b0;
}

.form-control,
.form-select {
  border-radius: 4px;
  border: 1.5px solid #ced4da;
}
</style>
