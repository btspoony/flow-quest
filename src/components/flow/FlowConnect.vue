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
const inAdmin = useAppStatusInAdmin()
const linkedAddress = useLinkedWalletAddress();
const isRegistering = useUserProfileInitializing();

const isMatchedWallet = computed(() => {
  return !linkedAddress.value || linkedAddress.value === wallet.value?.addr
})

const submitTx = ref<InstanceType<typeof FlowSubmitTransaction> | null>(null);

watch(user, ensureProfileRegistered)

onMounted(() => {
  ensureProfileRegistered(user.value, null)
})

function ensureProfileRegistered(newVal: ProfileData | null, oldVal: ProfileData | null) {
  if (wallet.value?.loggedIn && newVal && !newVal.profileRecord && isMatchedWallet.value) {
    if (!inAdmin.value && !submitTx.value?.isLoading && submitTx.value?.isSealed === undefined && !isRegistering.value) {
      isRegistering.value = true
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
  console.log('User registered:', wallet.value?.addr)
  await reloadCurrentUser()
  emit('registered')
}

function transactionReset() {
  setTimeout(() => {
    isRegistering.value = false
  }, 1000)
}
</script>

<template>
  <FlowConnectButton v-if="!wallet?.loggedIn" @connected="onConnected" />
  <FlowSubmitTransaction v-if="wallet?.loggedIn && !user?.profileRecord" ref="submitTx" action="Registering Profile"
    :hide-button="true" :hide-trx="hideTrx" :method="sendProfileRegister" @success="onProfileRegistered"
    @sealed="transactionReset" @error="transactionReset" />
</template>
