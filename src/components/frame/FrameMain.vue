<script setup lang="ts">
withDefaults(defineProps<{
  noTopbar?: boolean,
  contentLoading?: boolean
}>(), {
  noTopbar: false,
  contentLoading: false
});
</script>

<template>
  <main class="w-full mx-auto">
    <div v-if="!noTopbar" class="h-[90px]"></div>
    <slot name="header" />
    <div v-if="contentLoading" class="min-h-[calc(100vh-180px)] flex-center">
      <div :aria-busy="true" />
    </div>
    <div v-else class="relative container min-h-[calc(100vh-180px)]">
      <slot />
    </div>
  </main>
</template>
