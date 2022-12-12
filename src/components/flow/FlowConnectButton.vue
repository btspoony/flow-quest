<script setup lang="ts">
import { UserIcon } from "@heroicons/vue/24/solid";

const current = useFlowAccount();

onMounted(() => {
  const { $fcl } = useNuxtApp();
  $fcl.currentUser.subscribe((user) => {
    current.value = user;
    if (user) {
      console.log(`Flow User loggedIn: ${user.addr}`);
      const accountProof = user.services?.find(one => one.type === "account-proof")
      console.log(`Proof: ${JSON.stringify(accountProof?.data)}`)
    }
  });
});

function login() {
  const { $fcl } = useNuxtApp();
  $fcl.authenticate();
}
</script>

<template>
  <button class="inline-flex-between rounded-full mb-0" @click="login">
    <UserIcon class="fill-current h-5 w-5" />
    <small>Connect Wallet</small>
  </button>
</template>
