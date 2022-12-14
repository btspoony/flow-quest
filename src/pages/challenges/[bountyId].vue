<script setup lang="ts">
const route = useRoute()
const user = useUserProfile()

interface ChallengeDetail {
  season: CompetitionSeason,
  challenge: BountyInfo,
  quests: BountyInfo[]
}

const bountyId = computed(() => route.params.bountyId as string)

watch(bountyId, (newVal) => {
  refresh();
});

const { data: info, pending, refresh } = useAsyncData<ChallengeDetail>(`challenge:${bountyId.value}`, async () => {
  const season = await apiGetActiveSeason();
  const challenge = await apiGetCurrentChallenge(bountyId.value);

  const { $scripts } = useNuxtApp();
  const quests: BountyInfo[] = await $scripts.getQuestsDetail(season.seasonId, (challenge.config as ChallengeConfig).quests)
  return { season, challenge, quests }
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

const currentIndex = ref(0);
const progress = ref(0);

watchEffect(() => {
  if (info.value) {
    if (user.value && user.value.activeRecord && bountyId.value) {
      let len = info.value.quests.length
      let current = 0
      for (let i = 0; i < len; i++) {
        const quest = info.value.quests[i];
        const isQuestCompleted = !!user.value.activeRecord.bountiesCompleted[quest.id]
        if (isQuestCompleted) {
          current++
        } else {
          break
        }
      }
      currentIndex.value = current
    }
    progress.value = Math.floor(currentIndex.value / info.value.quests.length * 100)
  }
})

</script>

<template>
  <main v-if="pending" class="min-h-[80vh] flex-center">
    <div :aria-busy="true" />
  </main>
  <FrameGithubAuth v-else>
    <template v-slot:header>
      <div class="w-full h-36 relative overflow-hidden -z-10">
        <div class="absolute -inset-5 blur-lg bg-cover bg-center"
          :style="{ 'background-image': imageUrl ? `url(${imageUrl})` : undefined }" />
        <div class="absolute inset-0 bg-black/50" />
      </div>
    </template>
    <div class="h-14" />
    <section class="container max-w-2xl px-4">
      <div class=" -mt-36 mb-4 flex gap-4 items-center flex-col sm:flex-row justify-between sm:justify-center">
        <div class="flex-none" :aria-busy="pending">
          <div class="w-32 h-32 bg-cover rounded-lg"
            :style="{ 'background-image': imageUrl ? `url(${imageUrl})` : undefined }" />
        </div>
        <div v-if="challengeCfg" class="flex-1 flex gap-1 flex-col justify-between min-w-[360px]">
          <div class="flex items-center justify-center sm:justify-start min-h-[1.5rem]">
            <TagCommunity :community-id="challengeCfg?.communityId" />
          </div>
          <h3 class="section-header-text mb-3">{{ challengeCfg?.display.name }}</h3>
          <div class="flex gap-2 items-center justify-start">
            <span class="tag">{{ challengeCfg?.quests?.length ?? 0 }} Quests</span>
            <span class="tag">{{ totalPoints }} Points</span>
            <progress :value="progress" max="100" class="w-40 mb-[2px]" />
          </div>
        </div>
      </div>
      <div class="mb-4 prose-sm lg:prose">
        {{ challengeCfg?.display.description }}
      </div>
      <div role="separator" class="divider mb-10 mt-4" />
      <div class="flex flex-col gap-24">
        <ItemChallengeQuestBar v-for="(bounty, index) in info?.quests" :key="'idx_' + index" :bounty="bounty" :index="index"
          :isLast="(((info?.quests?.length ?? 0) - 1 === index) && !challengeCfg?.achievement)"
          :current="currentIndex" />
        <div v-if="challengeCfg?.achievement" class="flex-center flex-col gap-2">
          <span class="tag">Achievement FLOAT</span>
          <div class="relative">
            <div class="shiny" />
            <ItemFLOATEvent :host="challengeCfg?.achievement.host" :event-id="challengeCfg?.achievement.eventId" />
          </div>
        </div>
      </div>
    </section>
  </FrameGithubAuth>
</template>

<style scoped>
.shiny {
  @apply absolute pointer-events-none w-64 h-64 -top-14 -left-20;
  @apply bg-center bg-[url(/assets/images/shiny.png)] bg-contain;

  animation: spin 20s linear infinite;
  transform-origin: center;
}
</style>
