<template>
  <div class="container mt-4">
    <h2 class="mb-4">{{ isEditMode ? 'Edit Class Listing' : 'List Your Own Class' }}</h2>
    <div v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>

    <div v-if="hasConflict" class="alert alert-danger" role="alert">
      This class conflicts with your existing schedule. Please choose a different time or date.
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

      <!-- Form Fields -->
      <div class="col-md-8">
        <form @submit.prevent="submitForm">
          <!-- Category Selection -->
          <div class="card shadow mb-3 p-2">
            <div class="card-body">
              <div class="mb-3">
                <label for="category" class="form-label fs-5"><b>Category</b> <span class="text-danger">*</span></label>
                <select id="category" v-model="formData.mainCategory" @change="updateSubcategories"
                  class="form-select p-2 mb-2">
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

          <!-- Additional Information -->
          <div class="card shadow mb-3 p-2">
            <div class="card-body">
              <div class="mb-3">
                <label for="classTitle" class="form-label fs-5"><b>Class Title</b> <span
                    class="text-danger">*</span></label>
                <input type="text" id="classTitle" v-model="formData.classTitle" class="form-control p-2">
              </div>
              <div class="mb-3">
                <label for="price" class="form-label fs-5"><b>Price</b> <span class="text-danger">*</span></label>
                <input type="number" id="price" v-model="formData.price" @input="formatPrice" step="0.01" min="0"
                  class="form-control p-2">
              </div>
              <!-- Capacity and Skill Level -->
              <div class="row mb-3">
                <div class="col">
                  <label for="maxCapacity" class="form-label fs-5"><b>Max. Capacity</b> <span
                      class="text-danger">*</span></label>
                  <input type="number" id="maxCapacity" v-model="formData.maxCapacity" class="form-control p-2">
                </div>
                <div class="col">
                  <label for="skillLevel" class="form-label fs-5"><b>Skill Level</b> <span
                      class="text-danger">*</span></label>
                  <select id="skillLevel" v-model="formData.skillLevel" class="form-select">
                    <option value="" disabled selected>Select Skill Level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div class="mb-3">
                <label for="numberOfLessons" class="form-label fs-5"><b>Number of Lessons</b> <span
                    class="text-danger">*</span></label>
                <input type="number" id="numberOfLessons" v-model="formData.numberOfLessons" class="form-control p-2">
              </div>
              <div class="mb-3">
                <label for="location" class="form-label fs-5"><b>Location</b> <span class="text-danger">*</span></label>
                <input type="text" id="location" v-model="formData.location" class="form-control p-2">
              </div>
              <!-- Schedule Section -->
              <div class="mb-3">
                <label class="form-label fs-5"><b>Class Schedule</b> <span class="text-danger">*</span></label>
                <div class="row">
                  <div class="col">
                    <label for="date" class="form-label">Start Date</label>
                    <input type="date" v-model="formData.date" class="form-control p-2" id="date" :min="minDate">
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
                <input type="text" id="additionalNotes" v-model="formData.additionalNotes" class="form-control p-2"
                  placeholder="e.g Classes on every Monday">
              </div>
              <div class="mb-3">
                <label for="description" class="form-label fs-5"><b>Description</b> <span
                    class="text-danger">*</span></label>
                <textarea id="description" v-model="formData.description" class="form-control p-2" rows="5"></textarea>
              </div>
              <div>
                <span class="text-danger">*</span> Compulsory
              </div>
              <div class="text-end">
                <button type="submit" class="list btn btn-primary" :disabled="!isFormValid">{{ isEditMode ? 'Update Class'
                  : 'List Class' }}</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Conflict Modal -->
    <div class="modal fade" id="conflictModal" tabindex="-1" aria-labelledby="conflictModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title" id="conflictModalLabel">Schedule Conflict</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>This class conflicts with your existing schedule. Please choose a different time or date.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div class="modal fade" id="successModal" tabindex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title" id="successModalLabel">Success!</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"
              @click="goToDashboard"></button>
          </div>
          <div class="modal-body">
            <div class="text-center">
              <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
              <h4 class="mt-3">Your class has been successfully listed!</h4>
              <p class="mt-3">You can view and manage your classes in your dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, arrayUnion, query, where } from 'firebase/firestore';
import { db, storage, auth } from '../firebase/firebase_config';
import { Modal } from 'bootstrap';

export default {
  name: 'ListClass',
  setup() {
    const router = useRouter();
    const route = useRoute();
    let classId = route.params.classId;
    const isEditMode = ref(Boolean(classId));

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
    const conflictModal = ref(null);
    const successModal = ref(null);

    const minDate = computed(() => {
      const today = new Date();
      return today.toISOString().split('T')[0];
    });

    const formatPrice = computed(() => {
      if (this.formData.price !== null) {
        // Convert to string, limit to 2 decimal places, and convert back to number
        this.formData.price = Number(parseFloat(this.formData.price).toFixed(2));
      }
    });

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

    const checkForConflicts = async () => {
      if (!auth.currentUser) return false;

      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (!userDoc.exists()) return false;

      const userData = userDoc.data();
      const userClassesAsStudent = userData.upcoming_classes_as_student || [];
      const userClassesAsTeacher = userData.upcoming_classes_as_teacher || [];
      const allUserClasses = [...userClassesAsStudent, ...userClassesAsTeacher];

      for (const classId of allUserClasses) {
        const classDoc = await getDoc(doc(db, 'classes', classId));
        if (classDoc.exists()) {
          const existingClass = classDoc.data();
          if (isTimeConflict(formData.value, existingClass)) {
            return true;
          }
        }
      }

      return false;
    };

    const isTimeConflict = (newClass, existingClass) => {
      const newStart = new Date(`${newClass.date}T${newClass.startTime}`);
      const newEnd = new Date(`${newClass.date}T${newClass.endTime}`);
      const existingStart = existingClass.start_time.toDate();
      const existingEnd = existingClass.end_time.toDate();

      if (newStart.toDateString() !== existingStart.toDateString()) {
        return false;
      }

      return (
        (newStart < existingEnd && newEnd > existingStart) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart >= existingStart && newStart < existingEnd)
      );
    };

    const submitForm = async () => {
      if (!isFormValid.value) {
        alert('Please fill in all required fields and upload an image.');
        return;
      }

      const hasConflict = await checkForConflicts();

      if (hasConflict) {
        conflictModal.value.show();
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
          teacher_username: auth.currentUser.uid,
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
          start_date: new Date(formData.value.date),
          start_time: new Date(`${formData.value.date}T${formData.value.startTime}`),
          end_time: new Date(`${formData.value.date}T${formData.value.endTime}`),
          schedule: formData.value.additionalNotes,
          description: formData.value.description,
          reviews: [],
          ratings_average: 0
        };

        const completionDate = new Date(classData.start_date);
        completionDate.setDate(completionDate.getDate() + ((classData.number_of_lessons - 1) * 7));
        completionDate.setHours(23, 59, 59, 999); // Set time to 23:59:59.999
        classData.completion_date = completionDate;

        if (isEditMode.value) {
          const classRef = doc(db, 'classes', classId);
          await updateDoc(classRef, classData);
        } else {
          const classRef = await addDoc(collection(db, 'classes'), classData);
          classId = classRef.id;
        }

        // Update user and category data
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          posted_classes: arrayUnion({
            class_id: classId,
            ...classData
          }),
          upcoming_classes_as_teacher: arrayUnion(classId)
        });

        // Update categories
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

    const goToDashboard = () => {
      router.push('/dashboard');
    };

    onMounted(async () => {
      loading.value = true;
      await fetchCategories();
      if (isEditMode.value) await populateFormData();
      loading.value = false;
      conflictModal.value = new Modal(document.getElementById('conflictModal'));
      successModal.value = new Modal(document.getElementById('successModal'));
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
      isEditMode,
      minDate,
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
      submitForm,
      goToDashboard
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