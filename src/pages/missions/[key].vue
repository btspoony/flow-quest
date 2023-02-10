<script setup lang="ts">
import md from 'markdown-it';
import { Icon } from '@iconify/vue';

definePageMeta({
  key: route => route.path
})

const mdRenderer = md({ html: true })
const route = useRoute()
const user = useUserProfile()

interface MissionDetail {
  mission: BountyInfo | null,
  conditionUnlockStatus: boolean[],
  guideMD?: string,
  stepsCfg: MissionStepsConfig[],
}

const missionKey = computed(() => route.params.key as string)

watch(missionKey, (newVal) => {
  refresh();
});

const { data: info, pending, refresh } = useAsyncData<MissionDetail>(`mission:${missionKey.value}`, async () => {
  const current = useCurrentMission();
  const { $scripts } = useNuxtApp();
  const mission = current.value = await $scripts.getBountyByKey(missionKey.value);

  let guideMD: string | undefined
  let missionDetail: MissionDetailConfig | undefined

  let conditionUnlockStatus: boolean[] = []
  if (mission) {
    if (mission.preconditions.length > 0) {
      if (user.value?.address) {
        conditionUnlockStatus = await $scripts.getBountyUnlockStatus(mission.id, user.value?.address)
      } else {
        conditionUnlockStatus = Array(mission.preconditions.length).fill(false)
      }
    }

    const stepsCfgStr = await $fetch((mission?.config as MissionConfig).stepsCfg)
    if (stepsCfgStr) {
      try {
        const json = JSON.parse(stepsCfgStr as string)
        if (Array.isArray(json)) {
          missionDetail = { steps: json }
        } else {
          missionDetail = json as MissionDetailConfig
        }
        const guideURL = missionDetail.guide ?? (mission?.config as MissionConfig).guideMD
        if (typeof guideURL === 'string') {
          guideMD = await $fetch(guideURL)
        }
      } catch (e) {
        console.log('Failed to parse', e)
      }
    }
  }

  return {
    mission,
    conditionUnlockStatus,
    guideMD,
    stepsCfg: missionDetail?.steps ?? []
  }
}, {
  server: false
});

const isAllUnlocked = computed(() => info.value?.conditionUnlockStatus.reduce((prev, curr) => prev && curr, true))

const currentQuest = useCurrentQuest();
const hasBack = computed(() => !!currentQuest.value)

const bountyId = computed(() => info.value?.mission?.id)

const profileStatus = ref<MissionStatus | null>(null)
const isBountyCompleted = ref(false)

watchEffect(async () => {
  if (user.value && user.value.profileRecord && bountyId.value) {
    profileStatus.value = user.value.profileRecord.missionScores[missionKey.value]
    isBountyCompleted.value = user.value.profileRecord.bountiesCompleted[bountyId.value] !== undefined
  } else {
    await updateMission()
  }
}, {
  flush: 'post'
})

const missionCfg = computed(() => (info.value?.mission?.config as MissionConfig));
const imageUrl = computed(() => {
  if (missionCfg.value?.display.thumbnail) {
    return getIPFSUrl(missionCfg.value?.display.thumbnail)
  } else {
    return undefined
  }
})

const lockingArr = computed<boolean[]>(() => {
  const stepAmt = missionCfg.value?.steps ?? 10
  const result = Array(stepAmt).fill(true)
  if (!user.value?.profileRecord) return result

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

async function updateMission() {
  const { $scripts } = useNuxtApp();
  if (user.value?.address && bountyId.value) {
    profileStatus.value = await $scripts.profileGetMissionStatus(user.value?.address, missionKey.value)
    isBountyCompleted.value = await $scripts.profileIsBountyCompleted(user.value?.address, bountyId.value)
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
  <FrameMain :content-loading="pending || !missionCfg">
    <div class="w-full flex flex-wrap lg:flex-nowrap gap-4 lg:gap-6 justify-center">
      <div class="pt-10 flex-none w-full lg:w-auto lg:min-w-[40%] lg:max-w-[50%] flex flex-col gap-3">
        <div class="pb-2 flex gap-4">
          <div class="flex-none flex-center">
            <img class="rounded-full w-20 h-20" :src="imageUrl" alt="Mission Image">
          </div>
          <div class="flex-auto">
            <h4 class="mb-3">{{ missionCfg?.display.name }}</h4>
            <div class="mb-3 prose-sm prose-blockquote:py-0 prose-img:my-0"
              v-html="mdRenderer.render(missionCfg?.display.description)"></div>
          </div>
        </div>
        <!-- Mission Prepare -->
        <div class="flex flex-col gap-2">
          <AuthProfileLogin />
        </div>
        <div
          v-if="(info?.mission?.preconditions.length ?? 0) > 0 && (info?.mission?.preconditions.length === info?.conditionUnlockStatus.length) && !isAllUnlocked"
          class="flex flex-col gap-2">
          <template v-for="cond,i in info?.mission?.preconditions" :key="`cond_${i}_${cond.type}`">
            <ItemBountyPreconditionBar v-if="!info?.conditionUnlockStatus[i]" :condition="cond" :check-profile="true" />
          </template>
        </div>
        <!-- Mission steps -->
        <div class="flex flex-col gap-2">
          <ItemMissionStep v-for="i in missionCfg?.steps" :key="i" :mission="info?.mission!" :step="(i - 1)"
            :steps-cfg="info?.stepsCfg!" :is-completed="profileStatus?.steps[i - 1] ?? false"
            :is-locked="!isAllUnlocked || (lockingArr[i - 1] ?? false)" @success="updateMission" />
        </div>
        <div class="flex flex-col py-2">
          <div class="flex items-center gap-2">
            <BtnBack v-if="hasBack && isBountyCompleted" class="flex-0" />
            <FlowSubmitTransaction class="flex-auto" v-if="bountyId" :disabled="isInvalid || isBountyCompleted"
              :method="completeBounty" @success="reloadCurrentUser({ ignoreIdentities: true })">
              Complete
              <template v-slot:disabled>
                <div class="inline-flex-between">
                  <Icon icon="heroicons:lock-closed-solid" v-if="!isBountyCompleted" class="w-6 h-6" />
                  <span v-if="isBountyCompleted">Completed</span>
                </div>
              </template>
            </FlowSubmitTransaction>
          </div>
          <div role="separator" class="divider my-4" />
          <div class="flex-between">
            <div class="inline-flex-between">
              Reward
              <div class="tag">
                {{ info?.mission?.pointReward?.rewardPoints }} Points
              </div>
            </div>
            <div>
              {{ info?.mission?.participantAmt }} completed
            </div>
          </div>
        </div>
      </div>
      <article v-if="info?.guideMD"
        class="flex-auto rounded-xl h-[calc(100vh-240px)] overflow-x-clip overflow-y-scroll">
        <div class="prose-sm prose-blockquote:py-0 prose-img:my-0" v-html="mdRenderer.render(info.guideMD)" />
      </article>
    </div>
  </FrameMain>
</template>
