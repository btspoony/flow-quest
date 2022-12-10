<script setup lang="ts">
import md from 'markdown-it';
import { LockClosedIcon } from '@heroicons/vue/24/solid';

const mdRenderer = md()
const route = useRoute()

watch(route, (newVal) => {
  refresh();
});

interface QuestDetail {
  season: CompetitionSeason,
  quest: BountyInfo,
  status?: QuestStatus,
  guideMD: string,
  stepsCfg: QuestStepsConfig[]
}

const { data: info, pending, refresh } = useAsyncData<QuestDetail>('questDetail', async () => {
  const { $scripts } = useNuxtApp();

  const season = await apiGetActiveSeason();
  const questKey = route.params.key as string;
  const quest: BountyInfo = await apiGetCurrentQuest(questKey)
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
  // load user profile
  const profile = useUserProfile()
  let status: QuestStatus | undefined = undefined
  if (profile.value?.profile) {
    const address = profile.value?.profile?.address
    status = await $scripts.getQuestStatus(address, season.seasonId, questKey)
  }
  return { season, quest, status, guideMD: (guideMD as string ?? ""), stepsCfg }
}, {
  server: false
});

const questCfg = computed(() => (info.value?.quest.config as QuestConfig));
const imageUrl = computed(() => {
  if (questCfg.value?.display.thumbnail) {
    return getIPFSUrl(questCfg.value?.display.thumbnail)
  } else {
    return undefined
  }
})
function isStepCompleted(index: number) {
  return info.value?.status?.steps[index] ?? false
}

const isInvalid = computed(() => {
  // FIXME
  return true
})

function isLocked(index: number) {
  // FIXME
  return false
}

const isBountyCompleted = computed(() => {
  // FIXME
  return false
})

async function completeBounty() {
  // TODO
}
</script>

<template>
  <main class="container">
    <div v-if="(pending || !questCfg)" :aria-busy="true" />
    <div v-else class="w-full flex flex-wrap lg:flex-nowrap gap-8 justify-between">
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
          <button class="rounded-xl" @click="completeBounty()" :disabled="(isInvalid||isBountyCompleted)">
            <span v-if="isBountyCompleted">Completed</span>
            <LockClosedIcon v-if="(isInvalid||isBountyCompleted)" class="fill-current w-6 h-6" />
            <span v-else>Complete</span>
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
  </main>
</template>
