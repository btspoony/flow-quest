<script setup lang="ts">
const props = defineProps<{
  quest: BountyInfo,
  step: number,
  stepsCfg: QuestStepsConfig[]
  isCompleted: boolean,
  isLocked: boolean,
}>()

const stepCfg = computed(() => props.stepsCfg[props.step])
</script>

<template>
  <div class="card card-border p-4 flex items-center justify-between gap-2">
    <div class="flex-none">
      <span class="rounded-full inline-block w-8 h-8 flex-center bg-gray-200 dark:bg-gray-800">{{ step + 1 }}</span>
    </div>
    <div class="flex-auto text-lg font-semibold">
      {{ stepCfg?.title ?? "" }}
    </div>
    <div class="flex-none min-w-[160px]">
      <ItemQuestVerifyButton v-if="(!isLocked || isCompleted)" />
    </div>
  </div>
</template>
