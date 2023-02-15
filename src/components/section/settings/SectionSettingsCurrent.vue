<script setup lang="ts">
const currentSeason = useActiveSeason()

const endDate = computed<Date>(() => new Date((currentSeason.value?.endDate ?? 0) * 1000))
const endDateString = useLocaleDate(endDate)

const isEditEndDate = ref(false)
const editEndDate = ref<string | undefined>(undefined)

const editEndDatetime = computed(() => editEndDate.value ? new Date(editEndDate.value).valueOf() : -1)
const isValid = computed(() => editEndDate.value && Date.now() < new Date(editEndDate.value).valueOf() - 1000 * 60 * 60 * 24)

async function sendTransaction(): Promise<string> {
  const { $transactions } = useNuxtApp()
  return $transactions.adminUpdateEndDate(editEndDatetime.value)
}

</script>

<template>
  <section v-if="currentSeason" class="min-w-[24rem] p-6 flex flex-col md:flex-row gap-4">
    <div class="headings mb-2">
      <h2>Active Season</h2>
      <p>ID: {{ currentSeason?.seasonId }}</p>
    </div>
    <div>
      <h4 class="mb-1">Properties</h4>
      <div class="flex flex-col gap-2">
        <span class="inline-flex-between">
          <b class="tag">End Date</b>{{ endDateString }}
          <input type="checkbox" id="editEndDateSwith" name="switch" role="switch" v-model="isEditEndDate"
            @click="editEndDate = undefined">
        </span>
        <span class="inline-flex-between">
          <b class="tag">Referral Code Threshold</b>{{ currentSeason.referralThreshold }}
        </span>
      </div>
    </div>
    <div v-if="isEditEndDate">
      <h4 class="mb-1">Edit Properties</h4>
      <label for="endDate">
        Set new <b class="tag">End Date</b>
        <input type="date" id="endDate" v-model="editEndDate" />
      </label>
      <FlowSubmitTransaction :method="sendTransaction" :disabled="!isValid" @success="refreshActiveSeason()">
        <template v-slot:disabled>
          Invalid Date
        </template>
      </FlowSubmitTransaction>
    </div>
  </section>
</template>
