<script setup lang="ts">
const currentSpace = useCurrentSpace()

onMounted(() => {
  if (currentSpace.value) {
    currentSpace.value = null
  }
})

</script>

<template>
  <div class="hero">
    <div class="hero-content">
      Select a space or create a new space
    </div>
  </div>
</template>
