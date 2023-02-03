<script setup lang="ts">
import { Icon } from '@iconify/vue';
import md from 'markdown-it';

definePageMeta({
  key: route => route.path
})

const mdRenderer = md({ html: true })
const route = useRoute()
const user = useUserProfile()

interface QuestDetail {
  quest: BountyInfo | null,
  conditionUnlockStatus: boolean[],
  missions: BountyInfo[],
}

const bountyId = computed(() => route.params.bountyId as string)

watch([bountyId, user], (newVal) => {
  refresh();
});

const { data: info, pending, refresh } = useAsyncData<QuestDetail>(`quest:${bountyId.value}`, async () => {
  const current = useCurrentQuest();
  const { $scripts } = useNuxtApp();
  const quest = current.value = await $scripts.getBountyById(bountyId.value);

  let conditionUnlockStatus: boolean[] = []
  if (quest.preconditions.length > 0) {
    if (user.value?.address) {
      conditionUnlockStatus = await $scripts.getBountyUnlockStatus(bountyId.value, user.value?.address)
    } else {
      conditionUnlockStatus = Array(quest.preconditions.length).fill(false)
    }
  }

  let missions: BountyInfo[] = []
  if (quest) {
    missions = await $scripts.getMissionsDetail((quest.config as QuestConfig).missions)
  } else {
    missions = []
  }
  return { quest, conditionUnlockStatus, missions }
}, {
  server: false
});

const isAllUnlocked = computed(() => info.value?.conditionUnlockStatus.reduce((prev, curr) => prev && curr, true))
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

const isFinished = computed(() => progress.value >= 100)
const isCompleted = computed(() => {
  if (user.value && user.value.profileRecord) {
    return user.value.profileRecord.bountiesCompleted[bountyId.value] !== undefined
  } else {
    return false
  }
})

const achievementFloat = computed<FLOATAchievement | null>(() => {
  if (questCfg?.value?.achievement) {
    return questCfg.value.achievement
  } else if (info.value?.quest?.floatReward) {
    const floatReward = info.value?.quest?.floatReward
    return {
      host: floatReward.eventHost,
      eventId: floatReward.eventId
    }
  } else {
    return null
  }
})

const floatClaimable = ref(false)
const floatClaimed = ref(false)

watchEffect(async () => {
  if (progress.value >= 100 && isCompleted.value && achievementFloat.value && user.value?.address) {
    await updateHasClaimed()
    floatClaimable.value = !floatClaimed.value
  } else {
    floatClaimable.value = false
  }
})

async function updateHasClaimed() {
  const { $scripts } = useNuxtApp()
  const achiInfo = achievementFloat.value
  if (achiInfo && user.value?.address) {
    floatClaimed.value = await $scripts.hasFLOATClaimed(achiInfo.host, achiInfo.eventId, user.value?.address)
  } else {
    floatClaimed.value = false
  }
}

async function claimFloat(): Promise<string | null> {
  if (!achievementFloat.value) {
    return null
  }
  const { $transactions } = useNuxtApp()
  return $transactions.claimFloat(bountyId.value)
}

async function completeBounty(): Promise<string | null> {
  const result = await apiPostCompleteBounty(bountyId.value!)
  if (result) {
    if (result.transactionId) {
      return result.transactionId
    }
    if (result.error && result.error.message) {
      throw new Error(`[ErrCode:${result.error.code}] ${result.error.message}`)
    }
    if (!result.isAccountValid) {
      throw new Error("Account verification invalid")
    }
    if (!result.isBountyCompleted) {
      throw new Error("Bounty not completed")
    }
  } else {
    throw new Error("Failed to requeset")
  }
  return null
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
    <section class="container max-w-2xl px-4 pb-16">
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
      <div role="separator" class="divider my-2" />
      <div
        v-if="(info?.quest?.preconditions.length ?? 0) > 0 && (info?.quest?.preconditions.length === info?.conditionUnlockStatus.length) && !isAllUnlocked"
        class="flex flex-col gap-2">
        <template v-for="cond,i in info?.quest?.preconditions" :key="`cond_${i}_${cond.type}`">
          <ItemBountyPreconditionBar v-if="!info?.conditionUnlockStatus[i]" :condition="cond" :check-profile="true" />
        </template>
      </div>
      <div class="flex flex-col gap-24" v-if="info">
        <ItemQuestMissionBar v-for="(bounty, index) in info?.missions" :key="'idx_' + index" :bounty="bounty"
          :index="index" :isLast="false" :locked="!user?.profileRecord || !isAllUnlocked"
          :current="currentIndex" />
        <div class="flex-center">
          <article class="relative card non-interactive px-3 pt-2 w-fit">
            <div v-if="achievementFloat" :class="['flex-center flex-col gap-2', isFinished ? 'pb-14': 'pb-2']">
              <span :class="['tag', { 'success': isCompleted }]">Achievement FLOAT</span>
              <ItemFLOATEvent :host="achievementFloat?.host" :event-id="achievementFloat?.eventId" />
              <div class="absolute bottom-0 w-full !items-end">
                <button v-if="floatClaimed" class="secondary outline rounded-b-xl mb-0 w-full" disabled>Claimed</button>
                <FlowSubmitTransaction v-else-if="floatClaimable" class="w-full" :half-button="true" :method="claimFloat"
                  @success="updateHasClaimed()">
                  Claim
                </FlowSubmitTransaction>
              </div>
            </div>
            <div v-else class="min-w-[9rem] min-h-[7rem] py-2 flex-center flex-col gap-2">
              <Icon icon="game-icons:achievement" :class="['h-20 w-20', isCompleted ? 'text-success' : '']" />
              <TagCompleted v-if="isCompleted" />
            </div>
            <div class="shiny" v-if="isCompleted" />
            <template v-if="(user?.profileRecord || !achievementFloat) && isFinished && !isCompleted">
              <div class="overlay rounded-xl z-10"></div>
              <div class="absolute-full !items-end z-20">
                <FlowSubmitTransaction v-if="isFinished" class="w-full" :half-button="true" :method="completeBounty"
                  @success="reloadCurrentUser({ ignoreIdentities: true })">
                  {{ achievementFloat ? 'Unlock' : 'Complete' }}
                </FlowSubmitTransaction>
              </div>
            </template>
            </article>
        </div>
      </div>
    </section>
  </FrameGithubAuth>
</template>

<style scoped>
.shiny {
  @apply absolute pointer-events-none w-80 h-80 -top-20 -left-20 -z-10;
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
