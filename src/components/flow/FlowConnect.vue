<script setup lang="ts">
import { ArrowRightOnRectangleIcon } from "@heroicons/vue/24/solid";

const current = useFlowAccount();

function logout() {
  const { $fcl } = useNuxtApp();
  $fcl.unauthenticate();
}
</script>

<template>
  <div>
    <div v-if="current?.loggedIn" class="inline-flex-between">
      <span class="flex-auto h-4 leading-4 pl-4 pr-1 font-medium">
        {{ current?.addr ?? "No Address" }}
      </span>
      <button class="rounded-full inline-flex-between" @click="logout">
        <small>
          Logout
        </small>
        <ArrowRightOnRectangleIcon class="fill-current h-5 w-5" />
      </button>
    </div>
    <FlowConnectButton v-else />
  </div>
</template>
