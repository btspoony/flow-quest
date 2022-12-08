<script setup lang="ts">
import { LockClosedIcon } from '@heroicons/vue/24/solid';

const route = useRoute()
const current = useCurrentQuest()

watch(route, (newVal) => {
  refresh();
});

interface QuestDetail {
  quest: BountyInfo,
}

const { data: info, pending, refresh } = useAsyncData<QuestDetail>('questBounty', async () => {
  const { $scripts } = useNuxtApp();

  let quest: BountyInfo
  if (current.value) {
    quest = current.value
  } else {
    quest = await $scripts.getBountyByKey(route.params.questKey as string)
  }
  return { quest }
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
const isInvalid = computed(() => true) // FIXME

async function completeBounty() {
  // TODO
}
</script>

<template>
  <main class="container min-h-[calc(100vh-360px)]">
    <div v-if="(pending || !questCfg)" :aria-busy="true" />
    <div v-else class="w-full flex gap-8 justify-between">
      <div class="pt-10 flex-none w-5/12 flex flex-col gap-3">
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
          <ItemQuestStep v-for="i in questCfg?.steps" :key="i" :quest="info?.quest!" :step="i" />
        </div>
        <button class="rounded-xl" @click="completeBounty()" :disabled="isInvalid">
          <LockClosedIcon v-if="isInvalid" class="fill-current w-6 h-6" />
          <span v-else>Complete</span>
        </button>
          <div role="separator" class="divider my-2" />
          <div class="flex-between">
            <div>
              {{ info?.quest.participantAmt }} completed
            </div>
            <div>
              Participants
            </div>
          </div>
      </div>
      <article class="flex-auto rounded-xl">
        <h2>Guide</h2>
        <div>
          TODO
        </div>
      </article>
      </div>
  </main>
</template>
