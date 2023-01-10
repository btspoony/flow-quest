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
</script>

<template>
  <section v-if="currentSeason" class="min-w-[24rem] card card-border non-interactive p-6">
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
      <div class="flex flex-col">
        <h5>Bounties List</h5>
      </div>
      <div v-if="isEdit" class="card card-border non-interactive p-6 flex flex-col">
        <h5>New Bounty</h5>
      </div>
    </div>
  </section>
</template>
