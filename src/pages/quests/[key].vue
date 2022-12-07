<script setup lang="ts">
const route = useRoute()
const current = useCurrentQuest()

watch(route, (newVal) => {
  refresh();
});

interface QuestDetail {
  quest: BountyInfo
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
</script>

<template>
  <main class="container-fluid">
    Quest detail
  </main>
</template>
