<script setup lang="ts">
const user = useUserProfile()
const wallet = useFlowAccount()

const emit = defineEmits<{
  (e: "registered"): void;
}>();

const buttonContent = ref("Register for the season")

async function onProfileRegistered() {
  const { $scripts } = useNuxtApp();

  const address = wallet.value?.addr
  if (address) {
    user.value = await $scripts.loadUserProfile(address);
  }
  emit('registered')
}

async function sendProfileRegister(): Promise<string> {
  const { $transactions } = useNuxtApp()
  // FIXME: referredFrom
  return $transactions.registerForNewSeason()
}
</script>

<template>
  <FlowSubmitTransaction v-if="wallet?.loggedIn" :method="sendProfileRegister" @sealed="onProfileRegistered">
    {{ buttonContent }}
  </FlowSubmitTransaction>
</template>
