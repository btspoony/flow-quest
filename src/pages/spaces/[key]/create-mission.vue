<script setup lang="ts">
definePageMeta({
  title: "Space - create mission",
  key: route => route.path
})

const route = useRoute()
const spaceKey = computed<string>(() => typeof route.params.key === 'string' ? route.params.key : route.params.key[0])

const data = reactive<MissionConfigRequest>({
  key: '',
  name: '',
  description: '',
  steps: 0,
  stepsCfg: '',
})
provide(spaceNewMissionsInjectKey, [data])

function resetComp() {
  data.key = ''
  data.name = ''
  data.description = ''
  data.steps = 0
  data.stepsCfg = ''
}

function onTransactionSuccess() {
  const router = useRouter()
  router.push({ path: `/spaces/${spaceKey.value}`, query: { tab: 'Missions' } })
}

async function sendTransaction(): Promise<string> {
  const { $transactions } = useNuxtApp();
  return $transactions.spaceAddMissions(spaceKey.value, [{
    key: data.key,
    name: data.name,
    description: data.description,
    steps: data.steps,
    stepsCfg: data.stepsCfg,
  }])
}
</script>

<template>
  <div class="pt-8 flex flex-col gap-4">
    <BtnBack />
    <h2 class="mb-2">Create a new mission</h2>
    <FormSpaceNewMission :index="0" />
    <FlowSubmitTransaction :disabled="!data.valid" :method="sendTransaction"
      @success="onTransactionSuccess()" @sealed="resetComp()" @reset="resetComp()">
      <template v-slot:disabled>
        <span>Required parameters should be filled</span>
      </template>
    </FlowSubmitTransaction>
  </div>
</template>
