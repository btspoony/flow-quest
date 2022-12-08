<script setup lang="ts">
import { LockClosedIcon } from '@heroicons/vue/24/solid'

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

  if (props.bounty.config.category === 'challenge') {
    const current = useCurrentChallenge()
    current.value = props.bounty
    router.push(`/challenges/${props.bounty.id}`)
  } else {
    const quest = useCurrentQuest()
    quest.value = props.bounty
    router.push(`/quests/${props.bounty.config.key}`)
  }
}
</script>

<template>
  <article :class="['card card-border h-36', { 'w-full': full, 'highlight': highlight, 'cursor-pointer': !locked }]"
    @click="onClickCard()">
    <ItemChallengeInfoCard v-if="bounty.config.category === 'challenge'" :bounty="bounty" />
    <ItemQuestInfoCard v-else :bounty="bounty" />
    <div v-if="locked" class="overlay rounded-xl">
      <LockClosedIcon class="fill-current w-6 h-6" />
    </div>
  </article>
</template>
