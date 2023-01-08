<script setup lang="ts">
definePageMeta({
  key: route => route.path
})

const route = useRoute()
const spaceKey = computed<string>(() => typeof route.params.key === 'string' ? route.params.key : route.params.key[0])

const key = ref<string>("")
const display = reactive<Display>({
  name: "",
  description: "",
  thumbnail: ""
})
const existsQuestKeys = reactive<string[]>([])
const achievement = ref<FLOATAchievement | undefined>(undefined)

provide(spaceNewQuestsInjectKey, [])
const newQuestConfigs = inject(spaceNewQuestsInjectKey, [])

const isValid = computed(() => {
  return key.value && display.name && display.description && display.thumbnail && (existsQuestKeys.length > 0 || newQuestConfigs.length > 0)
})

function onTransactionSuccess() {
  const router = useRouter()
  router.push({ path: `/spaces/${spaceKey.value}`, query: { tab: 'Challenges' } })
}

async function sendTransaction(): Promise<string> {
  const { $transactions } = useNuxtApp();
  return $transactions.spaceAddChallenge(
    spaceKey.value,
    key.value,
    toRaw(display),
    toRaw(existsQuestKeys),
    toRaw(newQuestConfigs),
    achievement.value
  )
}

</script>

<template>
  <div class="pt-8 flex flex-col gap-4">
    <BtnBack />
    <h2 class="mb-2">Create a new challenge</h2>
    <FlowSubmitTransaction :disabled="!isValid" :method="sendTransaction" @success="onTransactionSuccess()">
      <template v-slot:disabled>
        <span>Required parameters should be filled</span>
      </template>
    </FlowSubmitTransaction>
  </div>
</template>
