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
  <div class="card p-0 w-full h-full flex flex-col gap-1">
    <div class="flex gap-2 justify-between">
      <TagCommunity :community-id="missionCfg?.communityId" />
      <TagCompleted v-if="isCompleted" />
    </div>
    <div class="h-full flex gap-2 justify-between">
      <div class="flex-auto flex flex-col gap-1">
        <h5 class="mb-0 truncate">{{ missionCfg?.display.name }}</h5>
        <div
          class="mb-0 max-h-[60px] prose-sm prose-blockquote:py-0 prose-p:leading-4  prose-p:text-sm prose-img:my-0 overflow-hidden text-ellipsis"
          v-html="mdRenderer.render(missionCfg?.display.description)">
        </div>
      </div>
      <div class="flex-none flex items-end justify-end">
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
