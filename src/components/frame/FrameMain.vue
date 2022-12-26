<script setup lang="ts">
withDefaults(defineProps<{
  noTopbar?: boolean
}>(), {
  noTopbar: false
});
</script>

<template>
  <main class="w-full mx-auto">
    <div v-if="!noTopbar" class="h-[90px]"></div>
    <slot name="header" />
    <div class="relative container min-h-[calc(100vh-240px)]">
      <slot />
    </div>
  </main>
</template>
