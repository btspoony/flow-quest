<script setup lang="ts">
import md from 'markdown-it';
import { LockClosedIcon } from '@heroicons/vue/24/solid';

definePageMeta({
  key: route => route.path
})

const mdRenderer = md()
const route = useRoute()
const user = useUserProfile()

interface QuestDetail {
  season: CompetitionSeason | null,
  quest: BountyInfo | null,
  guideMD: string,
  stepsCfg: QuestStepsConfig[],
}

const questKey = computed(() => route.params.key as string)

watch(questKey, (newVal) => {
  refresh();
});

const { data: info, pending, refresh } = useAsyncData<QuestDetail>(`quest:${questKey.value}`, async () => {
  const season = await apiGetActiveSeason();
  const quest = await apiGetCurrentQuest(questKey.value)
  let guideMD: any
  let stepsCfgStr: any

  if (quest) {
    // load quest config
    [guideMD, stepsCfgStr] = await Promise.all([
      $fetch((quest?.config as QuestConfig).guideMD),
      $fetch((quest?.config as QuestConfig).stepsCfg)
    ])
  }

  let stepsCfg: QuestStepsConfig[] = []
  if (stepsCfgStr) {
    try {
      stepsCfg = JSON.parse(stepsCfgStr as string)
    } catch (e) {
      console.log('Failed to parse', e)
    }
  }
  return {
    season,
    quest,
    guideMD: (guideMD as string ?? ""),
    stepsCfg
  }
}, {
  server: false
});

const bountyId = computed(() => info.value?.quest?.id)

const { data: isRegistered, refresh: userRefresh } = useAsyncData<boolean>('IsUserRegistered', async () => {
  const season = await apiGetActiveSeason();

  // load user profile
  let isRegistered: boolean
  if (user.value && user.value.activeRecord) {
    isRegistered = true
  } else {
    const { $scripts } = useNuxtApp();
    if (user.value?.address && season) {
      isRegistered = await $scripts.isProfileRegistered(user.value?.address, season.seasonId)
    } else {
      isRegistered = false
    }
  }
  return isRegistered
}, {
  server: false
})

const profileStatus = ref<QuestStatus | null>(null)
const isBountyCompleted = ref(false)

watch(user, (newVal, oldVal) => {
  userRefresh()
})

watchEffect(async () => {
  if (user.value && user.value.activeRecord && bountyId.value) {
    profileStatus.value = user.value.activeRecord.questScores[questKey.value]
    isBountyCompleted.value = user.value.activeRecord.bountiesCompleted[bountyId.value] !== undefined
  } else if (isRegistered.value) {
    await updateQuest()
  }
}, {
  flush: 'post'
})

const questCfg = computed(() => (info.value?.quest?.config as QuestConfig));
const imageUrl = computed(() => {
  if (questCfg.value?.display.thumbnail) {
    return getIPFSUrl(questCfg.value?.display.thumbnail)
  } else {
    return undefined
  }
})

const lockingArr = computed<boolean[]>(() => {
  const stepAmt = questCfg.value?.steps ?? 10
  const result = Array(stepAmt).fill(true)

  // not registered, be locked
  if (!isRegistered.value) return result

  const doneSteps = profileStatus.value?.steps ?? Array(stepAmt).fill(false)
  // all step before this should be done.
  let doneCurrent = true
  for (let i = 0; i < doneSteps.length; i++) {
    if (doneCurrent) {
      result[i] = false
    }
    doneCurrent = doneCurrent && doneSteps[i]
  }
  return result
})

const isInvalid = computed(() => {
  return !(profileStatus.value?.completed ?? false)
})

async function updateQuest() {
  const { $scripts } = useNuxtApp();
  const season = await apiGetActiveSeason();
  if (user.value?.address && bountyId.value && season) {
    profileStatus.value = await $scripts.profileGetQuestStatus(user.value?.address, season.seasonId, questKey.value)
    isBountyCompleted.value = await $scripts.profileIsBountyCompleted(user.value?.address, season.seasonId, bountyId.value)
  } else {
    profileStatus.value = null
    isBountyCompleted.value = false
  }
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
  <main v-if="pending || !questCfg" class="min-h-[80vh] flex-center">
    <div :aria-busy="true" />
  </main>
  <FrameGithubAuth v-else>
    <div class="w-full flex flex-wrap lg:flex-nowrap gap-8 justify-between">
      <div class="pt-10 flex-none w-full lg:w-5/12 flex flex-col gap-3">
        <div class="pb-2 flex gap-4">
          <div class="flex-none flex-center">
            <img class="rounded-full w-20 h-20" :src="imageUrl" alt="Quest Image">
          </div>
          <div class="flex-auto">
            <h4 class="mb-3">{{ questCfg?.display.name }}</h4>
            <p class="mb-3 prose-sm lg:prose">
              {{ questCfg?.display.description }}
            </p>
          </div>
        </div>
        <!-- Quest Prepare -->
        <div class="flex flex-col gap-2">
          <FlowConnect v-if="!user?.activeRecord || !isRegistered" @registered="userRefresh" />
        </div>
        <!-- Quest steps -->
        <div class="flex flex-col gap-2">
          <ItemQuestStep v-for="i in questCfg?.steps" :key="i" :quest="info?.quest!" :step="(i - 1)" :steps-cfg="info?.stepsCfg!"
            :is-completed="profileStatus?.steps[i - 1] ?? false" :is-locked="lockingArr[i - 1] ?? false" @success="updateQuest" />
        </div>
        <div class="flex flex-col py-2">
          <FlowSubmitTransaction v-if="bountyId" :disabled="isInvalid || isBountyCompleted" :method="completeBounty"
            @success="reloadCurrentUser({ ignoreIdentities: true })">
            Complete
            <template v-slot:disabled>
              <div class="inline-flex-between">
                <LockClosedIcon v-if="!isBountyCompleted" class="fill-current w-6 h-6" />
                <span v-if="isBountyCompleted">Completed</span>
              </div>
            </template>
          </FlowSubmitTransaction>
          <div role="separator" class="divider my-4" />
          <div class="flex-between">
            <div class="inline-flex-between">
              Reward
              <div class="tag">
                {{ info?.quest?.pointReward?.rewardPoints }} Points
              </div>
            </div>
            <div>
              {{ info?.quest?.participantAmt }} completed
            </div>
          </div>
          </div>
      </div>
      <article class="flex-auto rounded-xl h-[calc(100vh-240px)] overflow-x-clip overflow-y-scroll">
        <div v-if="info?.guideMD" class="prose-sm prose-blockquote:py-0 prose-img:my-0"
          v-html="mdRenderer.render(info?.guideMD)" />
      </article>
    </div>
  </FrameGithubAuth>
</template>
