<template>
  <div>
    <div v-if="current?.loggedIn" class="flex gap-1 items-center justify-between">
      <span class="flex-auto h-4 leading-4 pl-4 pr-1 font-medium">
        {{ current?.addr ?? "No Address" }}
      </span>
      <button class="inline-flex rounded-full" @click="logout">
        <small>
          Logout
        </small>
        <ArrowRightOnRectangleIcon class="fill-current h-5 w-5" />
      </button>
    </div>
    <button v-else class="rounded-full" @click="login">
      <small>Connect Wallet</small>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ArrowRightOnRectangleIcon } from "@heroicons/vue/24/solid";

const current = useFlowAccount();

onMounted(() => {
  const { $fcl } = useNuxtApp();
  $fcl.currentUser.subscribe((user) => {
    current.value = user;
    if (user) {
      console.log(`Flow User loggedIn: ${user.addr}`);
    }
  });
});

function login() {
  const { $fcl } = useNuxtApp();
  $fcl.authenticate();
}

function logout() {
  const { $fcl } = useNuxtApp();
  $fcl.unauthenticate();
}
</script>
