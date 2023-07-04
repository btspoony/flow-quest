<script setup lang="ts">
import { Icon } from '@iconify/vue';

const props = defineProps<{
  bounty: BountyInfo
}>();

const isEdit = ref(false)
const editPropertyKey = ref("")
const editPropertyValue = ref(false)
const originValue = ref(false)

type TabTypes = 'properties' | 'preconditions' | 'reward'
const currentTab = ref<TabTypes>('properties')
const tabs: { label: string, key: TabTypes }[] = [
  { label: "Properties", key: 'properties' },
  { label: "Preconditions", key: 'preconditions' },
  { label: "Reward", key: 'reward' }
]

function resetEdit() {
  if (isEdit.value) {
    // property
    editPropertyKey.value = ""
    editPropertyValue.value = false
    // precondition
    addPreconditionKey.value = UnlockConditionTypes.None
    // reward
    if (props.bounty.rewardType === 'Points') {
      rewardPoints[0] = props.bounty.pointReward!.rewardPoints
      referralPoints[0] = props.bounty.pointReward!.referalPoints
    }
  }
}

enum UnlockConditionTypes {
  None = "",
  MinimumPoint = 0,
  FLOATRequired = 1,
  CompletedBountyAmount = 2,
  BountyCompleted = 3,
}

const addPreconditionKey = ref<UnlockConditionTypes>(UnlockConditionTypes.None)
const preconditionOptions = ref([
  { label: 'Select a precondition type…', key: UnlockConditionTypes.None, disabled: true },
  { label: 'Add Precondition - Minimum point', key: UnlockConditionTypes.MinimumPoint },
  { label: 'Add Precondition - FLOAT required', key: UnlockConditionTypes.FLOATRequired },
  { label: 'Add Precondition - Bounty completed', key: UnlockConditionTypes.BountyCompleted },
])
const newPreconditionData = ref<UnlockConditions | null>(null)
watch(addPreconditionKey, (newVal, oldVal) => {
  if (newVal !== UnlockConditionTypes.None && newVal !== oldVal) {
    switch (newVal) {
      case UnlockConditionTypes.MinimumPoint:
        newPreconditionData.value = {
          type: newVal,
          amount: 0,
          usePermanentPoint: true
        }
        break;
      case UnlockConditionTypes.FLOATRequired:
        floatURL.value = ''
        newPreconditionData.value = {
          type: newVal,
          host: '',
          eventId: ''
        }
        break;
      case UnlockConditionTypes.BountyCompleted:
        targetBountyId.value = ""
        targetBountyInfo.value = null
        newPreconditionData.value = {
          type: newVal,
          bountyId: ''
        }
        break;
    }
  }
})

const floatURL = ref('')
watch(floatURL, (newVal) => {
  if (newPreconditionData.value?.type === UnlockConditionTypes.FLOATRequired) {
    try {
      const url = new URL(newVal)
      const items = url.pathname.split('/')
      if (items.length === 4) {
        const [_0, host, _1, eventId] = items
        if (typeof host === 'string' && typeof eventId === 'string') {
          newPreconditionData.value.host = host
          newPreconditionData.value.eventId = eventId
        }
      } else {
        newPreconditionData.value.host = ''
        newPreconditionData.value.eventId = ''
      }
    } catch (e) {
      newPreconditionData.value.host = ''
      newPreconditionData.value.eventId = ''
    }
  }
})

const targetBountyId = ref("")
const targetBountyInfo = ref<BountyInfo | null>(null)
watch(targetBountyId, async (newVal) => {
  if (newPreconditionData.value?.type === UnlockConditionTypes.BountyCompleted && newVal !== "" && newVal !== props.bounty.id) {
    const { $scripts } = useNuxtApp()
    try {
      targetBountyInfo.value = await $scripts.getBountyById(newVal)
      if (targetBountyInfo.value) {
        newPreconditionData.value.bountyId = newVal
      }
    } catch (e) { }
  }
})

watch(editPropertyKey, (newVal) => {
  switch (newVal) {
    case '0':
      originValue.value = editPropertyValue.value = props.bounty.properties.Launched
      break
    case '1':
      originValue.value = editPropertyValue.value = props.bounty.properties.Featured
      break
    case '2':
      originValue.value = editPropertyValue.value = props.bounty.properties.ForBeginner
      break
    case '3':
      originValue.value = editPropertyValue.value = props.bounty.properties.ForExpert
      break
  }
})

const rewardPoints = reactive<number[]>([]);
const referralPoints = reactive<number[]>([]);

provide(missionSettingPointsRewardInjectKey, {
  rewardPoints,
  referralPoints,
})

const isValid = computed(() => {
  if (!isEdit.value) return false;
  if (currentTab.value === 'properties') {
    return editPropertyKey.value !== '' && editPropertyValue.value !== originValue.value
  } else if (currentTab.value === 'preconditions') {
    switch (newPreconditionData.value?.type) {
      case UnlockConditionTypes.MinimumPoint:
        return newPreconditionData.value.amount > 0;
      case UnlockConditionTypes.FLOATRequired:
        return !!newPreconditionData.value.host && !!newPreconditionData.value.eventId;
      case UnlockConditionTypes.BountyCompleted:
        return !!newPreconditionData.value.bountyId;
    }
    return false
  } else if (currentTab.value === 'reward') {
    // TODO switch reward type
    return rewardPoints[0] > 0
      && referralPoints[0] >= 0 && referralPoints[0] <= rewardPoints[0]
      && (rewardPoints[0] !== props.bounty.pointReward?.rewardPoints || referralPoints[0] !== props.bounty.pointReward.referalPoints)
  }
  return false
})

async function sendTransaction(): Promise<string> {
  if (!isEdit.value) {
    throw new Error('Not editting')
  };
  const { $transactions } = useNuxtApp()
  if (currentTab.value === 'properties') {
    return $transactions.adminBountyUpdateProperty(
      props.bounty.id,
      editPropertyKey.value,
      editPropertyValue.value
    )
  } else if (currentTab.value === 'preconditions' && newPreconditionData.value) {
    return $transactions.adminAddPrecondition(
      props.bounty.id,
      newPreconditionData.value
    )
  } else if (currentTab.value === 'reward') {
    // TODO with different reward
    const rewardInfo: RewardInfos = {
      rewardType: 'Points',
      rewardPoints: toRaw(rewardPoints[0]),
      referalPoints: toRaw(referralPoints[0])
    }
    return $transactions.adminBountyUpdateReward(
      props.bounty.id,
      rewardInfo
    )
  } else {
    throw new Error("Invalid parameters")
  }
}

function removePrecondition(index: number) {
  return async (): Promise<string> => {
    if (!isEdit.value) {
      throw new Error('Not editting')
    };
    const { $transactions } = useNuxtApp()
    return $transactions.adminRemovePrecondition(props.bounty.id, index)

  }
}

async function onSuccess() {
  isEdit.value = false
  refreshActiveSeason(true)
}
</script>

<template>
  <div class="card card-border non-interactive p-2 w-full">
    <div class="flex justify-between gap-4">
      <span class="tag" :data-tooltip="`${bounty.config.category}: ${bounty.config.display.name}`" data-placement="right">
        {{ bounty.config.category.charAt(0).toUpperCase() }}
      </span>
      <NuxtLink :to="`/quests/${bounty.id}`" class="max-w-[10rem] truncate">
        {{ bounty.config.key }}
      </NuxtLink>
      <div class="flex-auto flex-center gap-2">
        <Icon :icon="bounty.properties.Launched ? 'heroicons:rocket-launch-solid' : 'heroicons:rocket-launch'"
          :class="['w-6 h-6', bounty.properties.Launched ? 'text-success' : 'opacity-20']" />
        <Icon v-if="bounty.properties.Featured"
          :icon="'heroicons:star-solid'" :class="['w-6 h-6 text-success']" />
        <Icon v-if="bounty.properties.ForBeginner"
          :icon="'heroicons:book-open-solid'" :class="['w-6 h-6 text-success']" />
        <Icon v-if="bounty.properties.ForExpert"
          :icon="'heroicons:academic-cap-solid'" :class="['w-6 h-6 text-success']" />
        <span class="text-gray-400/50">|</span>
        <Icon icon="heroicons:ticket-solid"
          :class="['w-6 h-6', bounty.preconditions.length > 0 ? 'text-success' : 'opacity-20']" />
        <template v-if="bounty.preconditions.length > 0">
          <span class="text-success">{{ bounty.preconditions.length }}</span>
        </template>
      </div>
      <label class="flex-none mb-0" :for="`editBounty${bounty.id}`">
        Edit
        <input type="checkbox" :id="`editBounty${bounty.id}`" role="switch" v-model="isEdit" @change="resetEdit" />
      </label>
    </div>
    <div v-if="isEdit">
      <div class="divider my-2"></div>
      <span class="tag">ID: {{ bounty.id }}</span>
      <h6 class="px-1 mb-1">{{ bounty.config.display.name }}</h6>
      <nav class="pb-2">
        <ul class="tabs">
          <li v-for="tab in tabs" :key="tab.key" :class="['tab-link tab-small', { 'active': currentTab === tab.key }]"
            @click="currentTab = tab.key">
            {{ tab.label }}
          </li>
        </ul>
      </nav>
      <div v-if="currentTab === 'properties'" class="flex flex-col gap-2">
        <select class="mb-0" v-model="editPropertyKey" required>
          <option value="" disabled selected>Select a property…</option>
          <option value="0">Property: Launching Status</option>
          <!-- <option value="1">Property: Feature Status</option> -->
          <option value="2">Property: For Beginner Flag</option>
          <option value="3">Property: For Expert Flag</option>
        </select>
        <template v-if="editPropertyKey !== ''">
          <label :for="`bounty${bounty.id}PropertyValue`" class="mb-0 flex justify-between">
            <span>Value: {{ editPropertyValue }}</span>
            <div>
              <input type="checkbox" :id="`bounty${bounty.id}PropertyValue`" class="mb-0" v-model="editPropertyValue">
            </div>
          </label>
          <FlowSubmitTransaction :disabled="!isValid" :method="sendTransaction" @success="onSuccess" />
        </template>
      </div>
      <div v-if="currentTab === 'preconditions'" class="flex flex-col gap-2">
        <div v-for="cond,i in bounty.preconditions" :key="`cond_${i}_${cond.type}`" class="flex items-center gap-2">
          <ItemBountyPreconditionBar :condition="cond" class="flex-auto" />
          <FlowSubmitTransaction :method="removePrecondition(i)" @success="onSuccess" content="DEL" />
        </div>
        <div class="divider my-2" v-if="bounty.preconditions.length > 0"></div>
        <select class="mb-0" v-model="addPreconditionKey" required>
          <option v-for="cond in preconditionOptions" :key="cond.label" :value="cond.key" :disabled="cond.disabled"
            :selected="addPreconditionKey==cond.key">
            {{ cond.label }}
          </option>
        </select>
        <template v-if="addPreconditionKey !== UnlockConditionTypes.None">
          <div v-if="newPreconditionData?.type === UnlockConditionTypes.MinimumPoint">
            <label :for="`bounty${bounty.id}NewPreconditionUsePermanetPoint`" class="mb-0 flex justify-between">
              <span>Check overall point: {{ newPreconditionData.usePermanentPoint }}</span>
              <div>
                <input type="checkbox" :id="`bounty${bounty.id}NewPreconditionUsePermanetPoint`" class="mb-0"
                  v-model="newPreconditionData.usePermanentPoint" />
              </div>
            </label>
            <label :for="`bounty${bounty.id}NewPreconditionMinimumPoint`" class="mb-0 w-full">
              <span>Minimum point</span>
              <input type="number" :id="`bounty${bounty.id}NewPreconditionMinimumPoint`" placeholder="0"
                v-model="newPreconditionData.amount" />
            </label>
          </div>
          <div v-else-if="newPreconditionData?.type === UnlockConditionTypes.FLOATRequired">
            <label for="achievementFLOAT">
              FLOAT
              <input type="url" id="achievementFLOAT" placeholder="https://floats.city/..." v-model="floatURL"
                :aria-invalid="floatURL ? !isValid : undefined" />
            </label>
            <div class="flex-center mb-2">
              <span v-if="!newPreconditionData.eventId">Preview</span>
              <ItemFLOATEvent v-else :host="newPreconditionData.host" :event-id="newPreconditionData.eventId" />
            </div>
          </div>
          <div v-else-if="newPreconditionData?.type === UnlockConditionTypes.BountyCompleted">
            <label :for="`bounty${bounty.id}NewPreconditionPreviousBounty`" class="mb-0 w-full">
              <span>Previous Bounty</span>
              <input type="text" :id="`bounty${bounty.id}NewPreconditionPreviousBounty`" v-model="targetBountyId"
                :aria-invalid="targetBountyId ? !isValid : undefined" />
            </label>
            <div class="flex-center mb-2">
              <span v-if="!targetBountyInfo">No Target</span>
              <h6 v-else class="mb-0">{{ targetBountyInfo.config.display.name }} </h6>
            </div>
          </div>
          <FlowSubmitTransaction :disabled="!isValid" :method="sendTransaction" @success="onSuccess" />
        </template>
      </div>
      <div v-if="currentTab === 'reward'" class="flex flex-col gap-1 p-2">
        <div class="flex gap-1 justify-around">
          <span>Reward: <b>{{ bounty.rewardType }}</b></span>
          <span v-if="bounty.rewardType === 'Points'" class="font-semibold">
            {{ bounty.pointReward?.rewardPoints }}({{ bounty.pointReward?.referalPoints }})
          </span>
        </div>
        <div class="divider my-2"></div>
        <SectionSettingsPartMissionSetter class="mb-2" :entity="bounty.config" :index="0" :reward-type="bounty.rewardType" />
        <FlowSubmitTransaction :disabled="!isValid" :method="sendTransaction" @success="onSuccess" />
      </div>
    </div>
  </div>
</template>
