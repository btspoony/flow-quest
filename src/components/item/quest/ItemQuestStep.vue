<script setup lang="ts">
const props = defineProps<{
  quest: BountyInfo,
  step: number,
  isCompleted: boolean,
  isLocked: boolean,
}>()
// TODO
</script>

<template>
  <div class="card card-border p-4 flex items-center justify-between gap-2">
    <div class="flex-none">
      <span class="rounded-full py-2 px-3 bg-gray-200 dark:bg-gray-800">{{ step + 1 }}</span>
    </div>
    <div class="flex-auto text-lg font-semibold">
      Description
    </div>
    <div class="flex-none min-w-[160px]">
      <ItemQuestVerifyButton v-if="(!isLocked || isCompleted)" />
    </div>
  </div>
</template>
