<script setup lang="ts">
const emit = defineEmits<{
  (e: 'added'): void
}>()

onMounted(() => {
  isSearching.value = false
  searchKey.value = ""
  selectedCommunity.value = ""
})

const selectedCommunity = ref("")
const selectedQuest = ref<QuestConfigDetail | null>(null)

const { data: communities, pending: isLoadingCommunities } = useAsyncData(`all_communities`, async () => {
  const { $scripts } = useNuxtApp()
  return await $scripts.spaceGetAll()
})

const isSearching = ref(false)
const searchKey = ref("")
async function onSearch() {
  if (!searchKey.value || isSearching.value) return
  isSearching.value = true

  selectedQuest.value = null
  const { $scripts } = useNuxtApp()
  const result = await $scripts.spaceGetQuestDetail(selectedCommunity.value, searchKey.value)
  selectedQuest.value = result
  rewardPoints.length = 0
  referralPoints.length = 0

  isSearching.value = false
}

const rewardPoints = reactive<number[]>([]);
const referralPoints = reactive<number[]>([]);

provide(missionSettingPointsRewardInjectKey, {
  rewardPoints,
  referralPoints,
})

const isValid = computed(() => {
  return selectedQuest.value?.missions.length === rewardPoints.length
    && rewardPoints.length === referralPoints.length
    && rewardPoints.filter(p => p <= 0).length === 0;
})

async function sendTransaction(): Promise<string> {
  if (!isValid) {
    throw new Error("Valid")
  }
  const { $transactions } = useNuxtApp()
  const rewards: PointRewardInfo[] = []
  rewardPoints.forEach((reward, index) => {
    rewards.push({
      rewardType: 'Points',
      rewardPoints: reward,
      referalPoints: referralPoints[index]
    })
  })
  return $transactions.adminAddQuestToSeason(toRaw(selectedQuest.value!.quest), rewards)
}

function onSuccess() {
  emit('added')
  refreshActiveSeason(true)
}
</script>

<template>
  <div class="mt-2 flex flex-col">
    <h5 class="mb-2">New Bounty</h5>
    <div class="flex gap-4">
      <label for="selectCommunity">
        Space
        <select id="selectCommunity" v-model="selectedCommunity" required>
          <option value="" disabled selected>
            {{ isLoadingCommunities? "Loading...": "Select a space" }}
          </option>
          <option v-for="one in communities" :key="one.key">{{ one.key }}</option>
        </select>
      </label>
      <label for="search">
        Search Quest
        <input type="search" id="searchInput" placeholder="Search Quest" :disabled="!selectedCommunity"
          v-model="searchKey" @change="onSearch">
      </label>
    </div>
    <WidgetLoadingCard v-if="isSearching" />
    <div v-else-if="selectedQuest" class="flex flex-col gap-2">
      <ItemSpaceQuestCard :quest="selectedQuest?.quest" />
      <h5 class="mb-1">Set Reward Points of Missions</h5>
      <SectionSettingsPartMissionSetter v-for="mission, index in selectedQuest.missions" :key="mission.key" :entity="mission"
        :index="index" reward-type="Points" />
      <FlowSubmitTransaction :method="sendTransaction" :disabled="!isValid" @success="onSuccess">
        <template v-slot:disabled>
          <span>Missing Parameters</span>
        </template>
      </FlowSubmitTransaction>
    </div>
  </div>
</template>
