<script setup lang="ts">
const route = useRoute()
const { space } = inject(spaceInjectKey, { space: useCurrentSpace() })
</script>

<template>
  <div class=" flex flex-col gap-4">
    <BtnGoPage :next="`${route.path}/create-quest`"> Create a new quest </BtnGoPage>
    <span>LIST 1</span>
    <span>LIST 2</span>
    <span>LIST 3</span>
    <span>LIST 4</span>
    <span>LIST 5</span>
  </div>
</template>
