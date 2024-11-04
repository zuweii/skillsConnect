<template>
  <div class="container mt-4">
    <h2 class="mb-4">List Your Class</h2>

    <!-- Error Alert -->
    <div v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>

    <!-- Loading Spinner -->
    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Form Content -->
    <div v-else class="row">
      <!-- Image Upload Section -->
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

      <!-- Form Fields -->
      <div class="col-md-8">
        <form @submit.prevent="submitForm">
          <!-- Category Selection -->
          <div class="card shadow mb-3 p-2">
            <div class="card-body">
              <div class="mb-3">
                <label for="category" class="form-label fs-5"><b>Category</b></label>
                <select id="category" v-model="formData.mainCategory" @change="updateSubcategories" class="form-select p-2 mb-2">
                  <option value="" disabled selected>Select a category</option>
                  <option v-for="category in categories" :key="category.category_name" :value="category.category_name">
                    {{ category.category_name }}
                  </option>
                </select>
                <select v-if="subcategories.length > 0" v-model="formData.subcategory" class="form-select p-2">
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

          <!-- Additional Information -->
          <div class="card shadow mb-3 p-2">
            <div class="card-body">
              <div class="mb-3">
                <label for="classTitle" class="form-label fs-5"><b>Class Title</b></label>
                <input type="text" id="classTitle" v-model="formData.classTitle" class="form-control p-2">
              </div>
              <div class="mb-3">
                <label for="price" class="form-label fs-5"><b>Price</b></label>
                <input type="number" id="price" v-model="formData.price" class="form-control p-2">
              </div>
              <!-- Capacity and Skill Level -->
              <div class="row mb-3">
                <div class="col">
                  <label for="maxCapacity" class="form-label fs-5"><b>Max. Capacity</b></label>
                  <input type="number" id="maxCapacity" v-model="formData.maxCapacity" class="form-control p-2">
                </div>
                <div class="col">
                  <label for="skillLevel" class="form-label fs-5"><b>Skill Level</b></label>
                  <select id="skillLevel" v-model="formData.skillLevel" class="form-select">
                    <option value="" disabled selected>Select Skill Level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div class="mb-3">
                <label for="numberOfLessons" class="form-label fs-5"><b>Number of Lessons</b></label>
                <input type="number" id="numberOfLessons" v-model="formData.numberOfLessons" class="form-control p-2">
              </div>
              <div class="mb-3">
                <label for="location" class="form-label fs-5"><b>Location</b></label>
                <input type="text" id="location" v-model="formData.location" class="form-control p-2">
              </div>
              <!-- Schedule Section -->
              <div class="mb-3">
                <label class="form-label fs-5"><b>Class Schedule</b></label>
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
                <label for="additionalNotes" class="form-label fs-5"><b>Additional Details</b></label>
                <input type="text" id="additionalNotes" v-model="formData.additionalNotes" class="form-control p-2">
              </div>
              <div class="mb-3">
                <label for="description" class="form-label fs-5"><b>Description</b></label>
                <textarea id="description" v-model="formData.description" class="form-control p-2" rows="5"></textarea>
              </div>
              <div class="text-end">
                <button type="submit" class="list btn btn-primary" :disabled="!isFormValid">List Class</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Success Modal -->
    <div class="modal fade" id="successModal" tabindex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-body position-relative p-4">
            <button type="button" class="btn-close position-absolute top-0 end-0 m-3" data-bs-dismiss="modal" aria-label="Close"></button>
            <div class="text-center mt-2">Your class has been successfully listed!</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, updateDoc, doc, getDocs, arrayUnion, query, where } from 'firebase/firestore';
import { db, storage, auth } from '../firebase/firebase_config';
import { Modal } from 'bootstrap';

export default {
  name: 'ListClass',
  setup() {
    const router = useRouter();
    const formData = ref({
      mainCategory: '',
      subcategory: '',
      classTitle: '',
      price: null,
      maxCapacity: null,
      skillLevel: '',
      numberOfLessons: null,
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
    const successModal = ref(null);

    const isFormValid = computed(() => {
      return formData.value.mainCategory &&
        formData.value.subcategory &&
        formData.value.classTitle &&
        formData.value.price &&
        formData.value.maxCapacity &&
        formData.value.skillLevel &&
        formData.value.numberOfLessons &&
        formData.value.location &&
        formData.value.date &&
        formData.value.startTime &&
        formData.value.endTime &&
        formData.value.description &&
        imageFile.value;
    });


    const fetchCategories = async () => {
      try {
        loading.value = true;
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        categories.value = categoriesSnapshot.docs.map(doc => ({
          category_name: doc.id,
          ...doc.data()
        }));
        loading.value = false;
      } catch (err) {
        console.error('Error fetching categories:', err);
        error.value = 'Failed to load categories. Please try again later.';
        loading.value = false;
      }
    };

    const updateSubcategories = () => {
      const selectedCategory = categories.value.find(cat => cat.category_name === formData.value.mainCategory);
      subcategories.value = selectedCategory && selectedCategory.sub_categories ? selectedCategory.sub_categories : [];
      formData.value.subcategory = '';
    };

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        previewImage.value = URL.createObjectURL(file);
        imageFile.value = file;
      }
    };

    const removePhoto = () => {
      previewImage.value = null;
      imageFile.value = null;
      const fileInput = document.getElementById('photo-upload');
      if (fileInput) {
        fileInput.value = '';
      }
    };

    const calculateCompletionDate = (startDate, numberOfLessons) => {
      const completionDate = new Date(startDate);
      // If number of lessons is 1, completion date is same as start date
      if (numberOfLessons > 1) {
        // Add (numberOfLessons - 1) weeks to the start date
        // We subtract 1 because the first lesson is on the start date
        completionDate.setDate(completionDate.getDate() + ((numberOfLessons - 1) * 7));
      }
      return completionDate;
    };

    const submitForm = async () => {
      if (!isFormValid.value) {
        alert('Please fill in all required fields and upload an image.');
        return;
      }

      try {
        const user = auth.currentUser;
        if (!user) {
          alert('You must be logged in to list a class.');
          return;
        }

        // Upload image to Firebase Storage
        const imageRef = storageRef(storage, `class-images/${Date.now()}_${imageFile.value.name}`);
        await uploadBytes(imageRef, imageFile.value);
        const imageUrl = await getDownloadURL(imageRef);

        // Calculate completion date
        const startDate = new Date(formData.value.date);
        const completionDate = calculateCompletionDate(
          startDate,
          parseInt(formData.value.numberOfLessons)
        );

        // Prepare class data
        const classData = {
          teacher_username: user.uid,
          image: imageUrl,
          category: formData.value.mainCategory,
          subcategory: formData.value.subcategory,
          title: formData.value.classTitle,
          price: parseFloat(formData.value.price),
          max_capacity: parseInt(formData.value.maxCapacity),
          current_enrollment: 0,
          skill_level: formData.value.skillLevel,
          number_of_lessons: parseInt(formData.value.numberOfLessons),
          location: formData.value.location,
          start_date: startDate,
          completion_date: completionDate, 
          start_time: new Date(`${formData.value.date}T${formData.value.startTime}`),
          end_time: new Date(`${formData.value.date}T${formData.value.endTime}`),
          schedule: formData.value.additionalNotes,
          description: formData.value.description,
          reviews: [],
          ratings_average: 0
        };

        // Add class to Firestore
        const classRef = await addDoc(collection(db, 'classes'), classData);
        const classId = classRef.id;

        // Update user's posted_classes and upcoming_classes_as_teacher
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          posted_classes: arrayUnion({
            class_id: classId,
            image: imageUrl,
            category: classData.category,
            subcategory: classData.subcategory,
            title: classData.title,
            price: classData.price,
            max_capacity: classData.max_capacity,
            skill_level: classData.skill_level,
            number_of_lessons: classData.number_of_lessons,
            location: classData.location,
            start_date: classData.start_date,
            completion_date: classData.completion_date, // Add completion date
            start_time: classData.start_time,
            end_time: classData.end_time,
            additional_schedule_info: classData.schedule,
            description: classData.description
          }),
          upcoming_classes_as_teacher: arrayUnion(classId)
        });

        // Rest of the code remains unchanged
        const categoriesRef = collection(db, 'categories');
        const categoryQuery = query(categoriesRef, where("category_name", "==", classData.category));
        const categoryQuerySnapshot = await getDocs(categoryQuery);

        if (!categoryQuerySnapshot.empty) {
          const categoryDoc = categoryQuerySnapshot.docs[0];
          await updateDoc(doc(db, 'categories', categoryDoc.id), {
            class_ids: arrayUnion(classId),
            sub_categories: arrayUnion(classData.subcategory)
          });
        } else {
          await addDoc(categoriesRef, {
            category_name: classData.category,
            sub_categories: [classData.subcategory],
            class_ids: [classId]
          });
        }

        successModal.value.show();
      } catch (err) {
        console.error('Error submitting form:', err);
        error.value = 'An error occurred while listing the class. Please try again.';
      }
    };

    const redirectToClassDetails = () => {
      router.push('/class-details');
    };

    onMounted(() => {
      successModal.value = new Modal(document.getElementById('successModal'));
      successModal.value._element.addEventListener('hidden.bs.modal', redirectToClassDetails);
      fetchCategories();
    });

    return {
      formData,
      categories,
      subcategories,
      previewImage,
      imageFile,
      error,
      loading,
      isFormValid,
      updateSubcategories,
      handleFileUpload,
      removePhoto,
      submitForm,
      redirectToClassDetails
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

.modal-content {
  border-radius: 15px;
}

.modal-body {
  padding: 2rem;
}

.btn-close:focus {
  box-shadow: none;
}
</style>