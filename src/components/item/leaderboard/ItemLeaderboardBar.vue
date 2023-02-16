<script setup lang="ts">
const props = defineProps<{
  score: RankingScore
}>()

function goAccountPage() {
  const router = useRouter()
  router.push(geneReferralLinkObject(`/account/${props.score.account}`))
}
</script>

<template>
  <div class="card card-border p-4 w-full flex gap-4 items-center justify-around cursor-pointer" @click="goAccountPage">
    <ItemLeaderboardRank class="flex-none" :rank="score.rank" />
    <div class="flex-none inline-flex rounded-[50%] overflow-hidden">
      <img v-if="score.identity?.display.thumbnail" class="max-w-[2.5rem] max-h-[2.5rem]"
        :src="score.identity.display.thumbnail" :alt="`PFP of ${score.identity.display.name}`" />
    </div>
    <div class="flex-auto">
      <div class="flex flex-col items-start">
        <span class="font-semibold">{{ score.identity?.display.name }}</span>
        <span class="text-xs">{{ getShortAddress(score.account) }} </span>
      </div>
    </div>
    <div class="flex-none">
      <span class="font-bold text-black dark:text-white">{{ score.score }}</span> Points
    </div>
  </div>
</template>
