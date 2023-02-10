<script setup lang="ts">
defineProps<{
  mission: MissionConfig,
  index: number,
  rewardType: MissionRewardType,
}>()
const injected = inject(missionSettingPointsRewardInjectKey)
</script>

<template>
  <div v-if="injected" class="card card-border non-interactive px-4 py-2 flex items-center justify-between gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <span class="rounded-full inline-block w-8 h-8 flex-center bg-gray-100 dark:bg-gray-900">
        {{ index + 1 }}
      </span>
      <span class="tag">{{ mission.key }}</span>
    </div>
    <div class="flex-auto grid" v-if="rewardType === 'Points'">
      <label :for="`rewardPoint_${index}`">
        Reward Points
        <input type="number" :id="`rewardPoint_${index}`" class="!my-1" placeholder="Reward Points"
          v-model="injected.rewardPoints[index]" required />
      </label>
      <label :for="`referralPoint_${index}`">
        Referral Points
        <input type="number" :id="`referralPoint_${index}`" class="!my-1" placeholder="Referral Points"
          v-model="injected.referralPoints[index]" :max="injected.rewardPoints[index]" required />
      </label>
    </div>
  </div>
</template>
