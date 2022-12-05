<script setup lang="ts">
defineProps<{
  bounty: BountyInfo
}>()
</script>

<template>
  <article class="rounded-xl">
    <ItemChallengeInfoCard v-if="bounty.config.category === 'challenge'" :bounty="bounty" />
    <ItemQuestInfoCard v-else :bounty="bounty" />
  </article>
</template>
