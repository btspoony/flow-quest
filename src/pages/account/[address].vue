<script setup lang="ts">
definePageMeta({
  key: route => route.path
})

</script>

<template>
  <FrameMain>
    <template v-slot:header>
      <div class="w-full h-36 relative overflow-hidden -z-10">
        HEADER
      </div>
    </template>
    Profile Page(WIP)
  </FrameMain>
</template>
