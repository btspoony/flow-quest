<script setup lang="ts">
const props = defineProps<{
  bounty: BountyInfo
}>();

const user = useUserProfile()

const questCfg = computed(() => (props.bounty.config as QuestConfig));
const progress = ref(0);

watchEffect(() => {
  if (user.value && user.value.profileRecord) {
    let len = questCfg.value.missions.length
    let current = 0
    for (let i = 0; i < len; i++) {
      const mission = questCfg.value.missions[i];
      const score = user.value.profileRecord.missionScores[mission.key]
      if (score?.completed) {
        current++
      } else {
        break
      }
    }
    progress.value = Math.floor(current / len * 100)
  } else {
    progress.value = 0
  }
})

const isCompleted = computed(() => {
  if (user.value && user.value.profileRecord) {
    return user.value.profileRecord.bountiesCompleted[props.bounty.id] !== undefined
  } else {
    return false
  }
});
</script>

<template>
  <div class="card card-border double-border h-36 w-full flex items-center justify-between gap-4">
    <div class="flex-1 flex flex-col justify-between gap-2 h-full">
      <div class="inline-flex gap-2 items-center justify-start">
        <TagCommunity :community-id="questCfg?.communityId" />
        <span class="tag">
          {{ questCfg.missions.length }} missions
        </span>
        <TagCompleted v-if="isCompleted" />
      </div>
      <div>
        <strong>{{ questCfg.display.name }}</strong>
      </div>
      <div class="w-full">
        <progress :value="progress" max="100" class="mb-0" />
      </div>
    </div>
    <div v-if="props.bounty.config?.display.thumbnail" class="flex-none">
      <div class="w-24 h-24 rounded-xl bg-gray-200/60 dark:bg-gray-800/60 overflow-hidden">
        <img class="object-contain w-full h-full" :src="getIPFSUrl(props.bounty.config?.display.thumbnail)"
          alt="Quest icon">
      </div>
    </div>
  </div>
</template>
