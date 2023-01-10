<script setup lang="ts">
const referralThreshold = ref<number>(20);
const endDate = ref<string | undefined>(undefined)

const endDatetime = computed(() => endDate.value ? new Date(endDate.value).valueOf() : -1)
const isValid = computed(() => endDatetime.value > Date.now() + 1000 * 30 && referralThreshold.value >= 0)

async function sendTransaction(): Promise<string> {
  const { $transactions } = useNuxtApp()
  return $transactions.adminNewSeason(endDatetime.value, referralThreshold.value)
}

</script>

<template>
  <section class="card card-border non-interactive min-w-[24rem] p-6">
    <h4>Setup a new season</h4>
    <form class="mb-0">
      <label for="endDate">
        Season End Date:
        <input type="date" id="endDate" v-model="endDate" />
      </label>
      <label for="referralThreshold">
        ReferralCode Threshold:
        <input type="number" id="referralThreshold" :min="0" v-model.number="referralThreshold" />
      </label>
      <FlowSubmitTransaction :method="sendTransaction" :disabled="!isValid" @success="refreshActiveSeason()">
        <template v-slot:disabled>
          Invalid Parameters
        </template>
      </FlowSubmitTransaction>
    </form>
  </section>
</template>
