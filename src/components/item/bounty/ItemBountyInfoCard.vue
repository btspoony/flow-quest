<script setup lang="ts">
const router = useRouter()
const props = withDefaults(defineProps<{
  bounty: BountyInfo
  full?: boolean
}>(), {
  full: true
})

const current = useCurrentBounty()

function onClickCard() {
  current.value = props.bounty
  if (props.bounty.config.category === 'challenge') {
    router.push(`/challenges/${props.bounty.id}`)
  } else {
    router.push(`/quests/${props.bounty.id}`)
  }
}
</script>

<template>
  <article :class="['card card-border cursor-pointer h-36', { 'w-full': full }]" @click="onClickCard()">
    <ItemChallengeInfoCard v-if="bounty.config.category === 'challenge'" :bounty="bounty" />
    <ItemQuestInfoCard v-else :bounty="bounty" />
  </article>
</template>
