<template>
  <div class="star-rating">
    <span
      v-for="index in 5"
      :key="index"
      :class="['star', { 'filled': index <= rating }]"
      @click="selectRating(index)"
      :style="{ cursor: readOnly ? 'default' : 'pointer' }"
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
    },
    readOnly: {
      type: Boolean,
      default: false
    }
  },
  emits: ['rating-selected'],
  methods: {
    selectRating(index) {
      if (!this.readOnly) {
        this.$emit('rating-selected', index); // Emit selected rating if not in read-only mode
      }
    }
  }
}
</script>

<style scoped>
.star-rating {
  display: inline-flex;
  font-size: 1.5rem;
}
.star {
  color: #e0e0e0;
}
.star.filled {
  color: #ffc107;
}
</style>
