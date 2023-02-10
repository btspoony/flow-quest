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
const selected = ref<MissionConfig | null>(null)

const { data: communities, pending: isLoadingCommunities } = useAsyncData(`all_communities`, async () => {
  const { $scripts } = useNuxtApp()
  return await $scripts.spaceGetAll()
})

const isSearching = ref(false)
const searchKey = ref("")
async function onSearch() {
  if (!searchKey.value || isSearching.value) return
  isSearching.value = true

  selected.value = null
  const { $scripts } = useNuxtApp()
  const missions = await $scripts.spaceSearchMissions(selectedCommunity.value, searchKey.value)
  if (missions.length > 0) {
    selected.value = missions[0]
  }
  rewardPoints[0] = 0
  referralPoints[0] = 0

  isSearching.value = false
}

const rewardPoints = reactive<number[]>([0]);
const referralPoints = reactive<number[]>([0]);

provide(missionSettingPointsRewardInjectKey, {
  rewardPoints,
  referralPoints,
})

const isValid = computed(() => {
  return rewardPoints[0] > 0 && referralPoints[0] >= 0;
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
  return $transactions.adminAddMissionToSeason(toRaw(selected.value!), {
    rewardType: 'Points',
    rewardPoints: toRaw(rewardPoints[0]),
    referalPoints: toRaw(referralPoints[0]),
  })
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
        Search Mission
        <input type="search" id="searchInput" placeholder="Search Quest" :disabled="!selectedCommunity"
          v-model="searchKey" @change="onSearch">
      </label>
    </div>
    <WidgetLoadingCard v-if="isSearching" />
    <div v-else-if="selected" class="flex flex-col gap-2">
      <ItemSpaceMissionCard :mission="selected" />
      <h5 class="mb-1">Set Reward</h5>
      <SectionSettingsPartMissionSetter :mission="selected" :index="0" reward-type="Points" />
      <FlowSubmitTransaction :method="sendTransaction" :disabled="!isValid" @success="onSuccess">
        <template v-slot:disabled>
          <span>Missing Parameters</span>
        </template>
      </FlowSubmitTransaction>
    </div>
  </div>
</template>
