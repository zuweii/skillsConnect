<template>
    <section class="class-list">
      <h3>{{ title }}</h3>
      <div class="class-cards">
        <ClassCard v-for="classItem in classes" :key="classItem.id" :classData="classItem" />
      </div>
    </section>
  </template>
  
  <script>
  import ClassCard from './ClassCard.vue';
  
  export default {
    components: { ClassCard },
    props: {
      classes: Array,
      title: String,
    },
  };
  </script>
  
  <style scoped>
  .class-list {
    padding: 2rem;
  }
  
  .class-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }
  </style>
  