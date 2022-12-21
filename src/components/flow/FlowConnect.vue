<script setup lang="ts">
import type FlowSubmitTransaction from './FlowSubmitTransaction.vue';

withDefaults(defineProps<{
  hideTrx?: boolean
}>(), {
  hideTrx: false
})

const emit = defineEmits<{
  (e: 'connected', address: string): void;
  (e: "registered"): void;
}>();

const user = useUserProfile()
const wallet = useFlowAccount()

const submitTx = ref<InstanceType<typeof FlowSubmitTransaction> | null>(null);

watch(user, ensureProfileRegistered, {
  flush: 'post'
})

onMounted(() => {
  ensureProfileRegistered(user.value, null)
})

function ensureProfileRegistered(newVal: ProfileData | null, oldVal: ProfileData | null) {
  if (newVal && !newVal.activeRecord) {
    if (!submitTx.value?.isLoading && !submitTx.value?.isSealed) {
      submitTx.value?.startTransaction()
    }
  }
}

async function sendProfileRegister(): Promise<string> {
  const { $transactions, $scripts } = useNuxtApp()
  let referredFrom: string | null = null

  const referralCode = useReferralCode()
  if (referralCode.value) {
    referredFrom = await $scripts.getReferralAddrByCode(referralCode.value)
    if (referredFrom) {
      console.log(`refer from address: ${referredFrom}`)
    }
  }
  return $transactions.registerForNewSeason(referredFrom)
}

function onConnected(addr: string) {
  emit('connected', addr)
}

async function onProfileRegistered() {
  await reloadCurrentUser()
  emit('registered')
}
</script>

<template>
  <FlowConnectButton v-if="!wallet?.loggedIn" @connected="onConnected" />
  <FlowSubmitTransaction ref="submitTx" v-if="wallet?.loggedIn && !user?.activeRecord" action="Registering Profile"
    :method="sendProfileRegister" :hide-button="true" :hide-trx="hideTrx" @success="onProfileRegistered" />
</template>
