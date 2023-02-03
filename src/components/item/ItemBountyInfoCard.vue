<script setup lang="ts">
import { Icon } from '@iconify/vue';

const router = useRouter()
const props = withDefaults(defineProps<{
  bounty: BountyInfo;
  full?: boolean;
  highlight?: boolean;
  locked?: boolean;
}>(), {
  full: true,
  highlight: false,
  locked: false,
})


function onClickCard() {
  if (props.locked) return

  if (props.bounty.config.category === 'quest') {
    const current = useCurrentQuest()
    current.value = props.bounty
    router.push(geneReferralLinkObject(`/quests/${props.bounty.id}`))
  } else {
    const mission = useCurrentMission()
    mission.value = props.bounty
    router.push(geneReferralLinkObject(`/missions/${props.bounty.config.key}`))
  }
}
</script>

<template>
  <article :class="['card card-border h-36', { 'w-full': full, 'bg-highlight': highlight, 'cursor-pointer': !locked }]"
    @click="onClickCard()">
    <ItemQuestInfoCard v-if="bounty.config.category === 'quest'" :bounty="bounty" />
    <ItemMissionInfoCard v-else :bounty="bounty" />
    <div v-if="locked" class="overlay rounded-xl">
      <Icon icon="heroicons:lock-closed-20-solid" class="w-6 h-6" />
    </div>
  </article>
</template>
