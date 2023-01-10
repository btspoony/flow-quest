<script setup lang="ts">
const currentSeason = useActiveSeason()

const activeBounties = computed<BountyInfo[]>(() => {
  const dic = currentSeason.value?.bounties
  if (!dic) {
    return []
  }
  const ret: BountyInfo[] = []
  for (const key in dic) {
    ret.push(dic[key])
  }
  return ret
})

const isEdit = ref(false)
function resetEditable() {
// TODO
}

const isSearching = ref(false)
const searchKey = ref("")
async function onSearch() {
  // TODO
}
</script>

<template>
  <section v-if="currentSeason" class="w-full card card-border non-interactive p-6">
    <div class="headings mb-4">
      <label class="w-full text-xl font-bold inline-flex-between" for="editSwicth">
        Available Bounties
        <input type="checkbox" id="editSwicth" role="switch" v-model="isEdit" @change="resetEditable()">
      </label>
      <p class="flex flex-col">
        <span>Amount: {{ activeBounties.length }}</span>
      </p>
    </div>
    <div class="flex justify-between gap-6">
      <div class="min-w-[22rem] flex flex-col">
        <h5>Bounties List</h5>
      </div>
      <div v-if="isEdit" class="card card-border non-interactive p-6 flex-auto flex flex-col">
        <h5>New Bounty</h5>
        <div class="flex gap-4">
          <label for="selectCommunity">
            Space
            <select id="selectCommunity" required>
              <option value="" selected>Select a space</option>
            </select>
          </label>
          <label for="search">
            Search Challenge
            <input type="search" id="challengeSearch" placeholder="Search Challenge" v-model="searchKey" @change="onSearch">
          </label>
        </div>
        <WidgetLoadingCard v-if="isSearching" />
      </div>
    </div>
  </section>
</template>
