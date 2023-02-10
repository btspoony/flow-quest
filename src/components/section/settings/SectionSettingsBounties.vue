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

type EditActions = 'none' | 'addquest' | 'addmission'

const isEdit = ref(false)
const editAction = ref<EditActions>('none')

function resetEdit() {
  if (isEdit.value) {
    editAction.value = 'none'
  }
}

</script>

<template>
  <section v-if="currentSeason" class="w-full p-6">
    <div class="headings mb-4">
      <h2 class="w-full inline-flex-between">
        Available Bounties
        <label class="mb-0 text-lg" for="editSwicth">
          Edit
          <input type="checkbox" id="editSwicth" role="switch" v-model="isEdit" @change="resetEdit" />
        </label>
      </h2>
      <p class="flex flex-col">
        <span>Amount: {{ activeBounties.length }}</span>
      </p>
    </div>
    <div class="flex justify-between gap-6">
      <div class="min-w-[22rem] flex flex-col gap-2">
        <h5 class="mb-2">Bounties List</h5>
        <SectionSettingsPartBountyItem v-for="one in currentSeason.bounties" :key="one.id" :bounty="one" />
      </div>
      <div v-if="isEdit" class="card card-border non-interactive p-6 flex-auto flex flex-col">
        <div class="flex items-center justify-start gap-2">
          <span class="font-bold text-xl">Edit:</span>
          <button class="mb-0 rounded-full text-xs max-w-fit" @click="editAction = 'addquest'">
            Add Quest as bounty
          </button>
          <button class="mb-0 rounded-full text-xs max-w-fit" @click="editAction = 'addmission'">
            Add Mission as bounty
          </button>
        </div>
        <div class="divider my-2"></div>
        <SectionSettingsPartNewBountyQuest v-if="editAction === 'addquest'" @added="editAction = 'none'" />
        <SectionSettingsPartNewBountyMission v-if="editAction === 'addmission'" @added="editAction = 'none'" />
      </div>
    </div>
  </section>
</template>
