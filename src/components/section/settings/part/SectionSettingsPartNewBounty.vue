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
const selectedChallenge = ref<ChallengeConfigDetail | null>(null)

const { data: communities, pending: isLoadingCommunities } = useAsyncData(`all_communities`, async () => {
  const { $scripts } = useNuxtApp()
  return await $scripts.spaceGetAll()
})

const isSearching = ref(false)
const searchKey = ref("")
async function onSearch() {
  if (!searchKey.value || isSearching.value) return
  isSearching.value = true

  selectedChallenge.value = null
  const { $scripts } = useNuxtApp()
  selectedChallenge.value = await $scripts.spaceGetChallengeDetail(selectedCommunity.value, searchKey.value)

  isSearching.value = false
}
</script>

<template>
  <div class="mt-2 flex flex-col">
    <h5 class="mb-2">New Bounty</h5>
    <div class="flex gap-4">
      <label for="selectCommunity">
        Space
        <select id="selectCommunity" v-model="selectedCommunity" required>
          <option value="" selected>{{ isLoadingCommunities? "Loading...": "Select a space" }}</option>
          <option v-for="one in communities" :key="one.key">{{ one.key }}</option>
        </select>
      </label>
      <label for="search">
        Search Challenge
        <input type="search" id="challengeSearch" placeholder="Search Challenge" :disabled="!selectedCommunity"
          v-model="searchKey" @change="onSearch">
      </label>
    </div>
    <WidgetLoadingCard v-if="isSearching" />
    <div v-else class="flex flex-col gap-2">
      {{ selectedChallenge }}
    </div>
  </div>
</template>
