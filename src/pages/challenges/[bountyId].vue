<script setup lang="ts">
const route = useRoute()
const current = useCurrentBounty()

watch(route, (newVal) => {
  refresh();
});

interface ChallengeDetail {
  challenge: BountyInfo,
  quests: BountyInfo[]
}

const { data: info, pending, refresh } = useAsyncData<ChallengeDetail>('challengeBounty', async () => {
  const { $scripts } = useNuxtApp();

  let challenge: BountyInfo
  if (current.value) {
    challenge = current.value
  } else {
    challenge = await $scripts.getBountyById(route.params.bountyId as string)
  }
  const quests: BountyInfo[] = await $scripts.getQuestsDetail((challenge.config as ChallengeConfig).quests)
  return { challenge, quests }
}, {
  server: false
});

const challengeCfg = computed(() => (info.value?.challenge.config as ChallengeConfig));
const imageUrl = computed(() => {
  if (challengeCfg.value?.display.thumbnail) {
    return getIPFSUrl(challengeCfg.value?.display.thumbnail)
  } else {
    return undefined
  }
})

const totalPoints = computed(() => {
  let points = 0
  info.value?.quests.forEach(quest => {
    if (quest.rewardType === 'Points') {
      points += quest.pointReward?.rewardPoints ?? 0
    }
  })
  return points
})

const progress = ref(0); // FIXME
</script>

<template>
  <main class="relative">
    <div class="w-full h-36 relative overflow-hidden -z-10">
      <div class="absolute -inset-5 blur-lg bg-cover bg-center"
        :style="{ 'background-image': imageUrl ? `url(${imageUrl})` : undefined }" />
      <div class="absolute inset-0 bg-black/50" />
    </div>
    <div class="h-14" />
    <section class="container max-w-2xl px-4">
      <div class=" -mt-36 mb-4 flex gap-4 items-center flex-col sm:flex-row justify-between sm:justify-center">
        <div class="flex-none" :aria-busy="pending">
          <div class="w-32 h-32 bg-cover rounded-lg"
            :style="{ 'background-image': imageUrl ? `url(${imageUrl})` : undefined }" />
        </div>
        <div v-if="challengeCfg" class="flex-1 flex gap-1 flex-col justify-between min-w-[360px]">
          <div class="flex items-center justify-center sm:justify-start">
            <span class="tag">{{ challengeCfg?.communityId }}</span>
          </div>
          <h3 class="section-header-text mb-3">{{ challengeCfg?.display.name }}</h3>
          <div class="flex gap-2 items-center justify-start">
            <span class="tag">{{ challengeCfg?.quests.length ?? 0 }} Quests</span>
            <span class="tag">{{ totalPoints }} Points</span>
            <progress :value="progress" max="100" class="w-40 mb-[4px]" />
          </div>
        </div>
      </div>
      <div class="flex flex-col">
        <p class="mb-4">
          {{ challengeCfg?.display.description }}
        </p>
      </div>
      <div role="separator" class="mb-10 mt-4 w-full bg-gray-700 h-[1px]" />
      <div class="flex flex-col gap-24">
        <div class="max-w-lg" v-for="(bounty, index) in info?.quests" :key="'idx_' + index">
          <ItemQuestInfoCard :bounty="bounty" />
        </div>
      </div>
    </section>
  </main>
</template>
