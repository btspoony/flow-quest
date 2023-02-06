<script setup lang="ts">
import md from 'markdown-it';
const props = defineProps<{
  bounty: BountyInfo
}>()

const user = useUserProfile()

const mdRenderer = md({ html: true })
const missionCfg = computed(() => (props.bounty.config as MissionConfig));

const isCompleted = computed(() => {
  if (user.value && user.value.profileRecord) {
    return user.value.profileRecord.bountiesCompleted[props.bounty.id] !== undefined
  } else {
    return false
  }
});
</script>

<template>
  <div class="card p-0 w-full h-full flex flex-col gap-4">
    <div class="h-full flex gap-2 justify-between">
      <div class="flex flex-col gap-1 max-w-[380px]">
        <h4 class="mb-0 truncate">{{ missionCfg?.display.name }}</h4>
        <div class="mb-0 prose-sm prose-blockquote:py-0 prose-img:my-0 max-h-[72px] overflow-hidden text-ellipsis"
          v-html="mdRenderer.render(missionCfg?.display.description)">
        </div>
      </div>
      <div class="flex flex-col items-end justify-between">
        <div>
          <TagCompleted v-if="isCompleted" />
        </div>
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
