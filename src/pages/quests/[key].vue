<script setup lang="ts">
import md from 'markdown-it';
import { LockClosedIcon } from '@heroicons/vue/24/solid';

const mdRenderer = md()
const route = useRoute()
const user = useUserProfile()
const wallet = useFlowAccount()

interface QuestDetail {
  season: CompetitionSeason,
  quest: BountyInfo,
  guideMD: string,
  stepsCfg: QuestStepsConfig[],
}

const questKey = computed(() => route.params.key as string)

watch(questKey, (newVal) => {
  refresh();
});

const { data: info, pending, refresh } = useAsyncData<QuestDetail>(`quest:${questKey.value}`, async () => {
  const season = await apiGetActiveSeason();
  const quest: BountyInfo = await apiGetCurrentQuest(questKey.value)
  // load quest config
  const [guideMD, stepsCfgStr] = await Promise.all([
    $fetch((quest.config as QuestConfig).guideMD),
    $fetch((quest.config as QuestConfig).stepsCfg)
  ])
  let stepsCfg: QuestStepsConfig[] = []
  try {
    stepsCfg = JSON.parse(stepsCfgStr as string)
  } catch (e) {
    console.log('Failed to parse', e)
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

const bountyId = computed(() => info.value?.quest.id)

const { data: isRegistered } = useAsyncData<boolean>('IsUserRegistered', async () => {
  const { $scripts } = useNuxtApp();
  const season = await apiGetActiveSeason();

  // load user profile
  let isRegistered: boolean
  if (user.value && user.value.activeRecord) {
    isRegistered = true
  } else {
    const address = wallet.value?.addr
    if (address) {
      isRegistered = await $scripts.isProfileRegistered(address, season.seasonId)
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

watchEffect(async () => {
  if (user.value && user.value.activeRecord && bountyId.value) {
    profileStatus.value = user.value.activeRecord.questScores[questKey.value]
    isBountyCompleted.value = user.value.activeRecord.bountiesCompleted[bountyId.value] !== undefined
  } else {
    await updateQuest()
  }
})

const questCfg = computed(() => (info.value?.quest.config as QuestConfig));
const imageUrl = computed(() => {
  if (questCfg.value?.display.thumbnail) {
    return getIPFSUrl(questCfg.value?.display.thumbnail)
  } else {
    return undefined
  }
})

const isInvalid = computed(() => {
  // FIXME
  return true
})

function isLocked(index: number) {
  // FIXME
  return false
}

function isStepCompleted(index: number) {
  return profileStatus.value?.steps[index] ?? false
}

async function updateQuest() {
  const { $scripts } = useNuxtApp();
  const address = wallet.value?.addr
  if (address && isRegistered.value) {
    const season = await apiGetActiveSeason();
    profileStatus.value = await $scripts.profileGetQuestStatus(address, season.seasonId, questKey.value)
    isBountyCompleted.value = await $scripts.profileIsBountyCompleted(address, season.seasonId, bountyId.value!)
  }
}

async function completeBounty() {
  // FIXME
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
        <div class="flex flex-col gap-2">
          <ItemQuestStep v-for="i in questCfg?.steps" :key="i" :quest="info?.quest!" :step="(i - 1)" :steps-cfg="info?.stepsCfg!"
            :is-completed="isStepCompleted(i)" :is-locked="isLocked(i)" />
        </div>
        <div class="flex flex-col py-2">
          <button class="rounded-xl" @click="completeBounty()" :disabled="(isInvalid || isBountyCompleted)">
            <div class="inline-flex-between">
              <span v-if="isBountyCompleted">Completed</span>
              <LockClosedIcon v-if="(isInvalid || isBountyCompleted)" class="fill-current w-6 h-6" />
              <span v-else>Complete</span>
            </div>
          </button>
          <div role="separator" class="divider my-2" />
          <div class="flex-between">
            <div>
              {{ info?.quest.participantAmt }} completed
            </div>
            <div>
              <!-- Participants -->
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
