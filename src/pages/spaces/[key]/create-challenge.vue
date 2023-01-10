<script setup lang="ts">
import type { UnwrapNestedRefs } from "vue";
import type WidgetDialog from '~/components/widget/WidgetDialog.vue';
const dialog = ref<InstanceType<typeof WidgetDialog> | null>(null);

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

const existsQuestKeys = reactive<string[]>([])

const newQuests = reactive<UnwrapNestedRefs<QuestConfigRequest>[]>([])
provide(spaceNewQuestsInjectKey, newQuests)

const cachedQuests = reactive<{ [key: string]: QuestConfig }>({})
const allValidQuests = computed<(QuestConfig | QuestConfigRequest)[]>(() => {
  const existQuests = existsQuestKeys.map(key => cachedQuests[key]).filter(one => !!one)
  const result: (QuestConfig | QuestConfigRequest)[] = newQuests.filter(one => one.valid)
  return result.concat(existQuests)
})

const searchQuestKey = ref('')
const searchedQuests = reactive<QuestConfig[]>([])
const searchedSelected = reactive<{ [key: string]: boolean }>({})

const isSearching = ref(false)
async function onSearchQuests() {
  if (isSearching.value) return
  isSearching.value = true

  const { $scripts } = useNuxtApp()
  const list = await $scripts.spaceSearchQuests(spaceKey.value, searchQuestKey.value)
  searchedQuests.length = 0
  for (const key in searchedSelected) {
    delete searchedSelected[key]
  }
  for (const one of list) {
    searchedQuests.push(one)
    searchedSelected[one.key] = false
  }
  isSearching.value = false
}

// Dialog

type OpenDialogueType = 'new' | 'search'
const dialogCategory = ref<OpenDialogueType>('new')

function onOpenDialogue(type: OpenDialogueType) {
  dialogCategory.value = type
  if (type === 'new') {
    newQuests.push(reactive<QuestConfigRequest>({
      key: '',
      name: '',
      description: '',
      steps: 0,
      stepsCfg: '',
      guideMD: '',
    }))
  } else {
    searchQuestKey.value = ""
    searchedQuests.length = 0
  }
  dialog.value?.openModal()
}

function closeDialog() {
  dialog.value?.closeModal()
}

function onCloseDialog() {
  if (dialogCategory.value === 'new') {
    const lastNewQuest = newQuests[newQuests.length - 1]
    if (!lastNewQuest?.valid) {
      newQuests.pop()
    }
  } else {
    for (const one of searchedQuests) {
      const isSelected = searchedSelected[one.key]
      delete searchedSelected[one.key]

      if (isSelected && !existsQuestKeys.includes(one.key)) {
        existsQuestKeys.push(one.key)
        cachedQuests[one.key] = one
      }
    }
  }
}

const isValid = computed(() => {
  return challengeKey.value && display.name && display.description && display.thumbnail && (existsQuestKeys.length > 0 || newQuests.length > 0)
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
    toRaw(newQuests).map(one => toRaw(one)),
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
    <h4 class="my-1">Add quests</h4>
    <div class="grid">
      <button class="rounded-xl flex-center mb-0" @click="onOpenDialogue('new')">Add a new quest</button>
      <button class="rounded-xl flex-center mb-0" @click="onOpenDialogue('search')">Search existing quests</button>
    </div>
    <ItemSpaceQuestCard v-for="one in allValidQuests" :key="one.key" :quest="one" />
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
  <WidgetDialog ref="dialog" @closed="onCloseDialog">
    <template v-if="dialogCategory === 'new'">
      <header class="mb-4">
        <h4 class="mb-0">Create a new Quest</h4>
      </header>
      <FormSpaceNewQuest :index="newQuests.length - 1" />
      <footer class="mt-4">
        <button class="rounded-xl flex-center mb-0" :disabled="!newQuests[newQuests.length - 1]?.valid"
          @click.stop.prevent="closeDialog">
          Add
        </button>
      </footer>
    </template>
    <template v-else>
      <header class="mb-4">
        <h4 class="mb-0">Search a existing quest</h4>
      </header>
      <input type="search" id="questSearch" placeholder="Search quest" v-model="searchQuestKey" @change="onSearchQuests">
      <WidgetLoadingCard v-if="isSearching" />
      <div v-else class="w-full max-h-[520px] flex-center flex-col gap-1">
        <div v-for="one in searchedQuests" :key="one.key" class="flex items-center gap-2">
          <input type="checkbox" :id="`select_${one.key}`" class="flex-none" v-model="searchedSelected[one.key]" />
          <ItemSpaceQuestCard :quest="one" class="flex-auto" />
        </div>
      </div>
      <footer class="mt-4">
        <button class="rounded-xl flex-center mb-0" :disabled="false" @click.stop.prevent="closeDialog">
          Add
        </button>
      </footer>
    </template>
  </WidgetDialog>
</template>
