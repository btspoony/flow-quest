<script setup lang="ts">
const props = defineProps<{
  score: RankingScore
}>()

const router = useRouter()

function goAccountPage() {
  router.push(geneReferralLinkObject(`/account/${props.score.account}`))
}
</script>

<template>
  <div class="card card-border p-4 w-full flex gap-4 items-center justify-around cursor-pointer" @click="goAccountPage">
    <div class="flex-none">
      <span v-if="score.rank === 1" class="circle-badge border-[#FFF71D] bg-yellow-400 text-white">
        {{ score.rank }}
      </span>
      <span v-else-if="score.rank === 2" class="circle-badge border-gray-100 bg-gray-400 text-white">
        {{ score.rank }}
      </span>
      <span v-else-if="score.rank === 3" class="circle-badge border-orange-200 bg-amber-600 text-white">
        {{ score.rank }}
      </span>
      <span v-else class="circle-badge !border-none bg-gray-200 dark:bg-gray-800">
        {{ score.rank }}
      </span>
    </div>
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

<style scoped>
.circle-badge {
  @apply rounded-full inline-block w-8 h-8 flex-center;
  @apply border-solid border-2;
}
</style>
