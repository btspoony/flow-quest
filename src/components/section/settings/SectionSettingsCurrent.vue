<script setup lang="ts">
const currentSeason = useActiveSeason()

const endDate = computed<Date>(() => new Date((currentSeason.value?.endDate ?? 0) * 1000))
const endDateString = useLocaleDate(endDate)

const isEditing = ref(false)
const editEndDate = ref<string | undefined>(undefined)
const editTitle = ref<string | undefined>(undefined)
const editRankingRewards = ref<string | undefined>(undefined)

const editEndDatetime = computed(() => editEndDate.value ? new Date(editEndDate.value).valueOf() : -1)
const isEndDateValid = computed(() => editEndDate.value && Date.now() < new Date(editEndDate.value).valueOf() - 1000 * 60 * 60 * 24)
const isValid = computed(() => isEndDateValid.value || editTitle.value || editRankingRewards.value)

function resetEditting() {
  if (isEditing.value) {
    editEndDate.value = undefined
    editTitle.value = undefined
    editRankingRewards.value = undefined
  }
}

async function sendTransaction(): Promise<string> {
  const { $transactions } = useNuxtApp()
  return $transactions.adminUpdateProperties({
    endDateTimestamp: isEndDateValid.value ? editEndDatetime.value : undefined,
    title: editTitle.value,
    rankingRewards: editRankingRewards.value,
  })
}
</script>

<template>
  <section v-if="currentSeason" class="min-w-[24rem] p-6 flex flex-col gap-2">
    <div class="headings !mb-0">
      <h2>Active Season</h2>
      <p>ID: {{ currentSeason?.seasonId }}</p>
    </div>
    <div>
      <div class="flex items-center justify-between gap-2">
        <h4 class="mb-1 inline-block">Properties</h4>
        <label for="editSwitch">
          Edit
          <input type="checkbox" id="editSwitch" name="switch" role="switch" v-model="isEditing"
            @click="resetEditting" />
        </label>
      </div>
      <div class="flex flex-col gap-2">
        <div class="inline-flex-between">
          <b class="tag">End Date</b>
          <span>{{ endDateString }}</span>
        </div>
        <div class="inline-flex-between">
          <b class="tag">Referral Code Threshold</b>
          <span>{{ currentSeason.referralThreshold }}</span>
        </div>
        <div class="inline-flex-between">
          <b class="tag">Title</b>
          <span>{{ currentSeason.title }}</span>
        </div>
        <div class="flex flex-col">
          <b class="tag w-fit">Ranking Rewards</b>
          <span>{{ currentSeason.rankingRewards }}</span>
        </div>
      </div>
    </div>
    <div v-if="isEditing">
      <h4 class="mb-1">Edit Properties</h4>
      <label for="newEndDate">
        Set new <b class="tag">End Date</b>
        <input type="date" id="newEndDate" v-model="editEndDate" />
      </label>
      <label for="newTitle">
        Set new <b class="tag">Title</b>
        <input type="text" id="newTitle" v-model="editTitle" />
      </label>
      <label for="newRankingRewards">
        Set new <b class="tag">Ranking Rewards</b>
        <input type="text" id="newRankingRewards" v-model="editRankingRewards" />
      </label>
      <FlowSubmitTransaction :method="sendTransaction" :disabled="!isValid" @success="refreshActiveSeason()">
        <template v-slot:disabled>
          Invalid Date
        </template>
      </FlowSubmitTransaction>
    </div>
  </section>
</template>
