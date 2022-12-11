<script setup lang="ts">
const props = defineProps<{
  bounty: BountyInfo
}>()

const questCfg = computed(() => (props.bounty.config as QuestConfig));
</script>

<template>
  <div class="card p-0 w-full h-full flex flex-col gap-4">
    <div class="h-full flex gap-4 justify-between">
      <div class="flex flex-col gap-1">
        <h4 class="mb-2">{{ questCfg?.display.name }}</h4>
        <p class="mb-2 text-sm">
          {{ questCfg?.display.description }}
        </p>
      </div>
      <div class="flex flex-col items-center justify-end">
        <span class="tag" v-if="bounty.rewardType === 'Points'">
          {{ bounty.pointReward?.rewardPoints }} Points
        </span>
        <span class="tag" v-else-if="bounty.rewardType === 'FLOAT'">
          FLOAT
        </span>
      </div>
    </div>
  </div>
</template>
