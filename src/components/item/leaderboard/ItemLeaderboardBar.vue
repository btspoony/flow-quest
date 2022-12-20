<script setup lang="ts">
const props = defineProps<{
  score: RankingScore
}>()
</script>

<template>
  <div class="card card-border p-4 w-full flex gap-4 items-center justify-between">
    <div class="flex-none">11</div>
    <div class="">{{ JSON.stringify(score) }}</div>
  </div>
</template>
