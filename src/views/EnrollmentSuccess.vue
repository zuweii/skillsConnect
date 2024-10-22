<template>
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Enrollment Successful!</h1>
      <p class="text-xl mb-4">You have successfully enrolled in {{ className }}.</p>
      <router-link :to="{ name: 'ClassDetails', params: { id: classId } }" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Back to Class Details
      </router-link>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { doc, getDoc } from 'firebase/firestore';
  import { db } from '../firebase/firebase_config';
  
  export default {
    name: 'EnrollmentSuccess',
    setup() {
      const route = useRoute();
      const classId = ref('');
      const className = ref('');
  
      const fetchClassData = async () => {
        try {
          classId.value = route.params.classId;
          const classDoc = await getDoc(doc(db, 'classes', classId.value));
  
          if (classDoc.exists()) {
            const classData = classDoc.data();
            className.value = classData.title;
          }
        } catch (err) {
          console.error('Error fetching class data:', err);
        }
      };
  
      onMounted(() => {
        fetchClassData();
      });
  
      return {
        classId,
        className,
      };
    },
  };
  </script>