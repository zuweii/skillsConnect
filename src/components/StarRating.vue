<template>
  <div class="star-rating">
    <span
      v-for="index in 5"
      :key="index"
      :class="['star', { 'filled': index <= Math.floor(rating), 'half-filled': index - 0.5 <= rating && index > Math.floor(rating) }]"
    >
      ★
    </span>
  </div>
</template>

<script>
export default {
  name: 'StarRating',
  props: {
    rating: {
      type: Number,
      required: true,
      validator: (value) => value >= 0 && value <= 5
    }
  }
}
</script>

<style scoped>
.star-rating {
  display: inline-flex;
  font-size: 1.25rem;
}
.star {
  color: #e0e0e0;
  position: relative;
}
.star.filled {
  color: #ffc107;
}
.star.half-filled::before {
  content: '★';
  color: #ffc107;
  position: absolute;
  left: 0;
  width: 50%;
  overflow: hidden;
}
</style>