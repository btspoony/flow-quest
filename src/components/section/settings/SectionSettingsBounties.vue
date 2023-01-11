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
const isAddChallenge = ref(false)

function resetEdit() {
  if (isEdit.value) {
    isAddChallenge.value = false
  }
}

</script>

<template>
  <section v-if="currentSeason" class="w-full card card-border non-interactive p-6">
    <div class="headings mb-4">
      <label class="w-full text-xl font-bold inline-flex-between" for="editSwicth">
        Available Bounties
        <input type="checkbox" id="editSwicth" role="switch" v-model="isEdit" @change="resetEdit">
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
        <h2 class="mb-1">Edit</h2>
        <div class="flex items-start justify-start gap-2">
          <button class="rounded-full text-xs max-w-fit" @click="isAddChallenge = true">Add Challenge as bounty</button>
        </div>
        <div class="divider"></div>
        <SectionSettingsPartNewBounty v-if="isAddChallenge" @added="isAddChallenge = false" />
      </div>
    </div>
  </section>
</template>
