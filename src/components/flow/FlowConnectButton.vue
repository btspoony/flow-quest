<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { Icon } from '@iconify/vue';

const current = useFlowAccount();

const emit = defineEmits<{
  (e: 'connected', address: string): void;
  (e: 'disconnected'): void;
}>();

onMounted(() => {
  const { $fcl } = useNuxtApp();
  $fcl.currentUser.subscribe((user) => {
    current.value = user;
    if (user) {
      console.log(`Flow User loggedIn: ${user.addr}`);
      const accountProof = user.services?.find(one => one.type === "account-proof")
      console.log(`Proof: ${JSON.stringify(accountProof?.data)}`)
      emit('connected', user.addr!)
    } else {
      emit('disconnected')
    }
  });
});

function login() {
  const { $fcl } = useNuxtApp();
  $fcl.authenticate();
}

const { width } = useWindowSize()
const narrow = computed(() => width.value < 1280)
</script>

<template>
  <button class="flex-center rounded-full mb-0" @click="login">
    <div class="inline-flex-around">
      <Icon icon="heroicons:user-20-solid" class="h-4 w-4" />
      <small>{{ narrow ? "Connect" : "Connect Wallet" }}</small>
    </div>
  </button>
</template>
