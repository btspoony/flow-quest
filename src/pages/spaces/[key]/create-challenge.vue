<script setup lang="ts">
definePageMeta({
  key: route => route.path
})

const route = useRoute()
const spaceKey = computed<string>(() => typeof route.params.key === 'string' ? route.params.key : route.params.key[0])

const challengeKey = ref<string>("")
const display = reactive<Display>({
  name: "",
  description: "",
  thumbnail: ""
})
const existsQuestKeys = reactive<string[]>([])
const achievement = ref<FLOATAchievement | undefined>(undefined)

const floatURL = ref('')
watch(floatURL, (newVal) => {
  try {
    const url = new URL(newVal)
    const items = url.pathname.split('/')
    if (items.length === 4) {
      const [_0, host, _1, eventId] = items
      achievement.value = { host, eventId }
    } else {
      achievement.value = undefined
    }
  } catch (e) {
    achievement.value = undefined
  }
})

provide(spaceNewQuestsInjectKey, [])
const newQuestConfigs = inject(spaceNewQuestsInjectKey, [])

const isValid = computed(() => {
  return challengeKey.value && display.name && display.description && display.thumbnail && (existsQuestKeys.length > 0 || newQuestConfigs.length > 0)
})

function onTransactionSuccess() {
  const router = useRouter()
  router.push({ path: `/spaces/${spaceKey.value}`, query: { tab: 'Challenges' } })
}

async function sendTransaction(): Promise<string> {
  const { $transactions } = useNuxtApp();
  return $transactions.spaceAddChallenge(
    spaceKey.value,
    challengeKey.value,
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
    <form class="mb-0">
      <div class="grid">
        <label for="challengeKey">
          Key
          <input type="text" id="challengeKey" placeholder="Unique Key" v-model="challengeKey" required />
        </label>
        <label for="challengeName">
          Name
          <input type="text" id="challengeName" placeholder="Display Name" v-model="display.name" required />
        </label>
      </div>
      <label for="challengeDesc">
        Description
        <input type="text" id="challengeDesc" placeholder="Description" v-model="display.description" required />
      </label>
      <WidgetUploader @ipfs-added="(cid) => { display.thumbnail = cid }">
        <template v-slot:preview>
          <img v-if="display.thumbnail" :src="getIPFSUrl(display.thumbnail)" alt="Image Preview" />
        </template>
      </WidgetUploader>
    </form>
    <div class="divider"></div>
    <h4>Add quests</h4>
    <div class="divider"></div>
    <div class="grid">
      <label for="achievementFLOAT">
        Achievement FLOAT (Optional)
        <input type="url" id="achievementFLOAT" placeholder="https://floats.city/..." v-model="floatURL"
          :aria-invalid="floatURL ? !achievement : undefined" />
      </label>
      <div class="flex-center">
        <span v-if="!achievement">Preview</span>
        <ItemFLOATEvent v-else :host="achievement.host" :event-id="achievement.eventId" />
      </div>
    </div>
    <FlowSubmitTransaction :disabled="!isValid" :method="sendTransaction" @success="onTransactionSuccess()">
      <template v-slot:disabled>
        <span>Required parameters should be filled</span>
      </template>
    </FlowSubmitTransaction>
  </div>
</template>
