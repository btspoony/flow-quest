<script setup lang="ts">
import md from 'markdown-it';
definePageMeta({
  key: route => route.path
})

const mdRenderer = md()
const route = useRoute()
const user = useUserProfile()

interface QuestDetail {
  quest: BountyInfo | null,
  missions: BountyInfo[]
}

const bountyId = computed(() => route.params.bountyId as string)

watch(bountyId, (newVal) => {
  refresh();
});

const { data: info, pending, refresh } = useAsyncData<QuestDetail>(`quest:${bountyId.value}`, async () => {
  const quest = await apiGetCurrentQuest(bountyId.value);

  const { $scripts } = useNuxtApp();
  let missions: BountyInfo[] = []
  if (quest) {
    missions = await $scripts.getMissionsDetail((quest.config as QuestConfig).missions)
  } else {
    missions = []
  }
  return { quest, missions }
}, {
  server: false
});

const questCfg = computed(() => (info.value?.quest?.config as QuestConfig));
const imageUrl = computed(() => {
  if (questCfg.value?.display.thumbnail) {
    return getIPFSUrl(questCfg.value?.display.thumbnail)
  } else {
    return undefined
  }
})

const totalPoints = computed(() => {
  let points = 0
  info.value?.missions.forEach(mission => {
    if (mission.rewardType === 'Points') {
      points += mission.pointReward?.rewardPoints ?? 0
    }
  })
  return points
})

const currentIndex = ref(0);
const progress = ref(0);

watchEffect(() => {
  if (info.value) {
    if (user.value && user.value.profileRecord && bountyId.value) {
      let len = info.value.missions.length
      let current = 0
      for (let i = 0; i < len; i++) {
        const mission = info.value.missions[i];
        const isMissionCompleted = !!user.value.profileRecord.bountiesCompleted[mission.id]
        if (isMissionCompleted) {
          current++
        } else {
          break
        }
      }
      currentIndex.value = current
    } else {
      currentIndex.value = 0
    }
    progress.value = Math.floor(currentIndex.value / info.value.missions.length * 100)
  }
})

const floatClaimable = ref(false)
const floatClaimed = ref(false)

watchEffect(async () => {
  if (progress.value >= 100 && questCfg?.value?.achievement && user.value?.address) {
    await updateHasClaimed()
    floatClaimable.value = !floatClaimed.value
  } else {
    floatClaimable.value = false
  }
})

async function updateHasClaimed() {
  const { $scripts } = useNuxtApp()
  const achiInfo = questCfg?.value?.achievement
  if (achiInfo && user.value?.address) {
    floatClaimed.value = await $scripts.hasFLOATClaimed(achiInfo.host, achiInfo.eventId, user.value?.address)
  } else {
    floatClaimed.value = false
  }
}

async function claimFloat(): Promise<string | null> {
  if (!questCfg?.value.achievement) {
    return null
  }
  const { $transactions } = useNuxtApp()
  const achi = questCfg?.value.achievement
  return $transactions.claimFloat(achi.host, achi.eventId)
}

</script>

<template>
  <FrameGithubAuth :content-loading="pending">
    <template v-slot:header>
      <div class="w-full h-36 relative overflow-hidden -z-10">
        <div class="absolute -inset-5 blur-lg bg-cover bg-center"
          :style="{ 'background-image': imageUrl ? `url(${imageUrl})` : undefined }" />
        <div class="absolute inset-0 bg-black/40" />
      </div>
    </template>
    <div class="h-14" />
    <section class="container max-w-2xl px-4">
      <div class=" -mt-36 mb-4 flex gap-4 items-center flex-col sm:flex-row justify-between sm:justify-center">
        <div class="flex-none" :aria-busy="pending">
          <div class="w-32 h-32 rounded-lg bg-gray-200/60 dark:bg-gray-800/60 overflow-hidden">
            <img v-if="imageUrl" class="object-contain w-full h-full" :src="imageUrl" alt="Quest Icon">
          </div>
        </div>
        <div v-if="questCfg" class="flex-1 flex gap-1 flex-col justify-between min-w-[360px]">
          <div class="flex items-center justify-center sm:justify-start min-h-[1.5rem]">
            <TagCommunity :community-id="questCfg?.communityId" />
          </div>
          <h3 class="section-header-text mb-3">{{ questCfg?.display.name }}</h3>
          <div class="flex gap-2 items-center justify-start">
            <span class="tag">{{ questCfg?.missions?.length ?? 0 }} Missions</span>
            <span class="tag">{{ totalPoints }} Points</span>
            <progress :value="progress" max="100" class="w-40 mb-[2px]" />
          </div>
        </div>
      </div>
      <div class="mb-4 prose-sm prose-blockquote:py-0 prose-img:my-0"
        v-html="mdRenderer.render(questCfg?.display.description)"></div>
      <div role="separator" class="divider mb-11 mt-4" />
      <div class="flex flex-col gap-24">
        <ItemQuestMissionBar v-for="(bounty, index) in info?.missions" :key="'idx_' + index" :bounty="bounty"
          :index="index" :isLast="(((info?.missions?.length ?? 0) - 1 === index) && !questCfg?.achievement)"
          :current="currentIndex" />
        <div v-if="questCfg?.achievement" class="flex-center flex-col gap-2">
          <span class="tag">Achievement FLOAT</span>
          <div class="relative">
            <div class="shiny" />
            <ItemFLOATEvent :host="questCfg?.achievement.host" :event-id="questCfg?.achievement.eventId" />
          </div>
          <button v-if="floatClaimed" class="secondary outline rounded-xl w-[8rem]" disabled>Claimed</button>
          <FlowSubmitTransaction v-else-if="floatClaimable" class="min-w-[8rem]" :method="claimFloat"
            @success="updateHasClaimed()">
            Claim
          </FlowSubmitTransaction>
        </div>
      </div>
    </section>
  </FrameGithubAuth>
</template>

<style scoped>
.shiny {
  @apply absolute pointer-events-none w-80 h-80 -top-24 -left-24 -z-10;
  @apply bg-center bg-[url(/assets/images/shiny.png)] bg-contain;

  animation: spin 20s linear infinite;
  transform-origin: center;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
