<script setup lang="ts">
import { Icon } from '@iconify/vue';

const props = defineProps<{
  bounty: BountyInfo
}>();

const isEdit = ref(false)
const editPropertyKey = ref("")
const editPropertyValue = ref(false)
const originValue = ref(false)

type TabTypes = 'properties' | 'preconditions'
const currentTab = ref<TabTypes>('properties')
const tabs: { label: string, key: TabTypes }[] = [
  { label: "Properties", key: 'properties' },
  { label: "Preconditions", key: 'preconditions' },
]

function resetEdit() {
  if (isEdit.value) {
    editPropertyKey.value = ""
    editPropertyValue.value = false
  }
}

watch(editPropertyKey, (newVal) => {
  if (newVal === '0') {
    originValue.value = editPropertyValue.value = props.bounty.properties.Launched
  } else if (newVal === '1') {
    originValue.value = editPropertyValue.value = props.bounty.properties.Featured
  }
})

const isValid = computed(() => isEdit.value && editPropertyKey.value !== '' && editPropertyValue.value !== originValue.value)

async function sendTransaction(): Promise<string> {
  const { $transactions } = useNuxtApp()
  return $transactions.adminBountyUpdateProperty(
    props.bounty.id,
    editPropertyKey.value,
    editPropertyValue.value
  )
}

async function onSuccess() {
  isEdit.value = false
  refreshActiveSeason(true)
}
</script>

<template>
  <div class="card card-border non-interactive p-2 w-full">
    <div class="flex justify-between gap-2">
      <span class="tag" :data-tooltip="`${bounty.config.category}: ${bounty.config.display.name}`" data-placement="right">
        {{ bounty.config.category.charAt(0).toUpperCase() }}
      </span>
      <NuxtLink :to="`/quests/${bounty.id}`" class="max-w-[10rem] truncate">
        {{ bounty.config.key }}
      </NuxtLink>
      <div class="flex-auto flex-center gap-2">
        <Icon :icon="bounty.properties.Launched ? 'heroicons:rocket-launch-solid' : 'heroicons:rocket-launch'"
          :class="['w-6 h-6', bounty.properties.Launched ? 'text-success' : 'opacity-20']" />
        <Icon :icon="bounty.properties.Featured ? 'heroicons:star-solid' : 'heroicons:star'"
          :class="['w-6 h-6', bounty.properties.Featured ? 'text-success' : 'opacity-20']" />
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
        <div v-for="cond,i in bounty.preconditions" :key="`cond_${i}_${cond.type}`">
          {{ JSON.stringify(cond) }}
        </div>
      </div>
    </div>
  </div>
</template>
