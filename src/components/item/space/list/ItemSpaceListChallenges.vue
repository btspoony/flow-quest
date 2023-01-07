<script setup lang="ts">
const route = useRoute()
const { space } = inject(spaceInjectKey, { space: useCurrentSpace() })
</script>

<template>
  <div class=" flex flex-col gap-4">
    <BtnGoPage :next="`${route.path}/create-challenge`"> Create a new challenge </BtnGoPage>
    <span>LIST 1</span>
    <span>LIST 2</span>
  </div>
</template>
