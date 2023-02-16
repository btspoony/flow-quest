<script setup lang="ts">
withDefaults(defineProps<{
  rank: number;
  label?: string;
}>(), {
  label: undefined
})
</script>

<template>
<div>
  <span v-if="rank === 1" class="circle-badge border-[#FFF71D] bg-yellow-400 text-white">
    {{ label ?? rank }}
  </span>
  <span v-else-if="rank === 2" class="circle-badge border-gray-100 bg-gray-400 text-white">
    {{ label ?? rank }}
  </span>
  <span v-else-if="rank === 3" class="circle-badge border-orange-200 bg-amber-600 text-white">
    {{ label ?? rank }}
  </span>
  <span v-else class="circle-badge !border-none bg-gray-200 dark:bg-gray-800">
    {{ label ?? rank }}
  </span>
</div>
</template>

<style scoped>
.circle-badge {
  @apply rounded-full inline-block w-8 h-8 flex-center;
  @apply border-solid border-2;
}
</style>
