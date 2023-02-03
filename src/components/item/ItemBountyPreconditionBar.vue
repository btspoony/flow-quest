<script setup lang="ts">
import { Icon } from '@iconify/vue';
const props = withDefaults(defineProps<{
  condition: UnlockConditions,
  checkProfile?: boolean
}>(), {
  checkProfile: false
})

enum UnlockConditionTypes {
  None = "",
  MinimumPoint = 0,
  FLOATRequired = 1,
  CompletedBountyAmount = 2,
  BountyCompleted = 3,
}

// const targetBountyInfo = ref<BountyInfo | null>(null)
// watchEffect(async () => {
//   if (props.condition.type === UnlockConditionTypes.BountyCompleted) {

//   }
// })
</script>

<template>
  <div
    class="card card-border non-interactive p-3 bg-gray-100 dark:bg-gray-900 w-full flex items-center justify-start gap-2">
    <!-- <div>
      You cannot complete this challenge yet
    </div> -->
    <template v-if="condition.type === UnlockConditionTypes.MinimumPoint">
      <Icon icon="heroicons:calculator" class="text-secondary h-5 w-5 mx-1" />
      <span>
        You need to gain more than
        <b class="tag secondary">
          {{ condition.amount }} Points{{ condition.seasonId !== '0' ? ' (Season)' : '' }}
        </b>
        first
      </span>
    </template>
    <template v-else-if="condition.type === UnlockConditionTypes.FLOATRequired">
      <Icon icon="heroicons:academic-cap-solid" class="text-secondary h-5 w-5 mx-1" />
      <ItemFLOATEvent :host="condition.host" :event-id="condition.eventId" small />
      <span>is <b class="text-primary">required</b> to unlock the quest</span>
    </template>
    <template v-else-if="condition.type === UnlockConditionTypes.BountyCompleted">
      <Icon icon="heroicons:check-circle-solid" class="text-secondary h-5 w-5 mx-1" />
      <span>
        You need to complete the previous
        <NuxtLink :to="geneReferralLink(`/quests/${condition.bountyId}`)">Quest</NuxtLink> first
      </span>
    </template>
  </div>
</template>
