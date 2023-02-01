<script setup lang="ts">
import type { UnwrapNestedRefs } from "vue";
import type WidgetDialog from '~/components/widget/WidgetDialog.vue';
const dialog = ref<InstanceType<typeof WidgetDialog> | null>(null);

definePageMeta({
  key: route => route.path
})

const route = useRoute()
const spaceKey = computed<string>(() => typeof route.params.key === 'string' ? route.params.key : route.params.key[0])

const questKey = ref<string>("")
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

const existsMissionKeys = reactive<string[]>([])

const newMissions = reactive<UnwrapNestedRefs<MissionConfigRequest>[]>([])
provide(spaceNewMissionsInjectKey, newMissions)

const cachedMissions = reactive<{ [key: string]: MissionConfig }>({})
const allValidMissions = computed<(MissionConfig | MissionConfigRequest)[]>(() => {
  const existMissions = existsMissionKeys.map(key => cachedMissions[key]).filter(one => !!one)
  const result: (MissionConfig | MissionConfigRequest)[] = newMissions.filter(one => one.valid)
  return result.concat(existMissions)
})

const searchMissionKey = ref('')
const searchedMissions = reactive<MissionConfig[]>([])
const searchedSelected = reactive<{ [key: string]: boolean }>({})

const isSearching = ref(false)
async function onSearchMissions() {
  if (isSearching.value) return
  isSearching.value = true

  const { $scripts } = useNuxtApp()
  const list = await $scripts.spaceSearchMissions(spaceKey.value, searchMissionKey.value)
  searchedMissions.length = 0
  for (const key in searchedSelected) {
    delete searchedSelected[key]
  }
  for (const one of list) {
    searchedMissions.push(one)
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
    newMissions.push(reactive<MissionConfigRequest>({
      key: '',
      name: '',
      description: '',
      steps: 0,
      stepsCfg: '',
    }))
  } else {
    searchMissionKey.value = ""
    searchedMissions.length = 0
  }
  dialog.value?.openModal()
}

function closeDialog() {
  dialog.value?.closeModal()
}

function onCloseDialog() {
  if (dialogCategory.value === 'new') {
    const lastNewMission = newMissions[newMissions.length - 1]
    if (!lastNewMission?.valid) {
      newMissions.pop()
    }
  } else {
    for (const one of searchedMissions) {
      const isSelected = searchedSelected[one.key]
      delete searchedSelected[one.key]

      if (isSelected && !existsMissionKeys.includes(one.key)) {
        existsMissionKeys.push(one.key)
        cachedMissions[one.key] = one
      }
    }
  }
}

const isValid = computed(() => {
  return questKey.value && display.name && display.description && display.thumbnail && (existsMissionKeys.length > 0 || newMissions.length > 0)
})

function onTransactionSuccess() {
  const router = useRouter()
  router.push({ path: `/spaces/${spaceKey.value}`, query: { tab: 'Quests' } })
}

async function sendTransaction(): Promise<string> {
  const { $transactions } = useNuxtApp();
  return $transactions.spaceAddQuest(
    spaceKey.value,
    questKey.value,
    toRaw(display),
    toRaw(existsMissionKeys),
    toRaw(newMissions).map(one => toRaw(one)),
    achievement.value
  )
}

</script>

<template>
  <div class="pt-8 flex flex-col gap-4">
    <BtnBack />
    <h2 class="mb-2">Create a new quest</h2>
    <form class="mb-0">
      <div class="grid">
        <label for="questKey">
          Key
          <input type="text" id="questKey" placeholder="Unique Key" v-model="questKey" required />
        </label>
        <label for="questName">
          Name
          <input type="text" id="questName" placeholder="Display Name" v-model="display.name" required />
        </label>
      </div>
      <label for="questDesc">
        Description
        <textarea id="questDesc" placeholder="Description" class="resize-y h-28 max-h-60" v-model.trim="display.description"
          required />
      </label>
      <WidgetUploader @ipfs-added="(cid) => { display.thumbnail = cid }">
        <template v-slot:preview>
          <img v-if="display.thumbnail" :src="getIPFSUrl(display.thumbnail)" alt="Image Preview" />
        </template>
      </WidgetUploader>
    </form>
    <div class="divider"></div>
    <h4 class="my-1">Add missions</h4>
    <div class="grid">
      <button class="rounded-xl flex-center mb-0" @click="onOpenDialogue('new')">Add a new mission</button>
      <button class="rounded-xl flex-center mb-0" @click="onOpenDialogue('search')">Search existing missions</button>
    </div>
    <ItemSpaceMissionCard v-for="one in allValidMissions" :key="one.key" :mission="one" />
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
        <h4 class="mb-0">Create a new Mission</h4>
      </header>
      <FormSpaceNewMission :index="newMissions.length - 1" />
      <footer class="mt-4">
        <button class="rounded-xl flex-center mb-0" :disabled="!newMissions[newMissions.length - 1]?.valid"
          @click.stop.prevent="closeDialog">
          Add
        </button>
      </footer>
    </template>
    <template v-else>
      <header class="mb-4">
        <h4 class="mb-0">Search a existing mission</h4>
      </header>
      <input type="search" id="SearchInput" placeholder="Search mission" v-model="searchMissionKey"
        @change="onSearchMissions">
      <WidgetLoadingCard v-if="isSearching" />
      <div v-else class="w-full max-h-[520px] flex-center flex-col gap-1">
        <div v-for="one in searchedMissions" :key="one.key" class="flex items-center gap-2">
          <input type="checkbox" :id="`select_${one.key}`" class="flex-none" v-model="searchedSelected[one.key]" />
          <ItemSpaceMissionCard :mission="one" class="flex-auto" />
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
