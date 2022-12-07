<script setup lang="ts">
const route = useRoute()
const current = useCurrentQuest()

watch(route, (newVal) => {
  // refresh();
});

interface QuestDetail {
  quest: BountyInfo
}

// const { data: info, pending, refresh } = useAsyncData<QuestDetail>('challengeBounty', async () => {
//   const { $scripts } = useNuxtApp();

//   let quest: BountyInfo
//   if (current.value) {
//     quest = current.value
//   } else {
//     // challenge = await $scripts.getQuestsDetail (route.params.bountyId as string)
//   }
//   // const quests: BountyInfo[] = await $scripts.getQuestsDetail((challenge.config as ChallengeConfig).quests)
//   return { quest }
// }, {
//   server: false
// });

// const questCfg = computed(() => (info.value?.quest.config as QuestConfig));

</script>

<template>
  <main class="container-fluid">
    Quest detail
  </main>
</template>
