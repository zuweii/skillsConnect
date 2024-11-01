<template>
  <div class="star-rating">
    <span
      v-for="index in 5"
      :key="index"
      :class="['star', { 'filled': index <= rating }]"
      @click="selectRating(index)"
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
  },
  emits: ['rating-selected'],
  methods: {
    selectRating(index) {
      this.$emit('rating-selected', index); // Emit selected rating
    }
  }
}
</script>

<style scoped>
.star-rating {
  display: inline-flex;
  font-size: 1.5rem;
  cursor: pointer;
}
.star {
  color: #e0e0e0;
  position: relative;
}
.star.filled {
  color: #ffc107;
}
</style>
