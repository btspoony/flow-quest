<script setup lang="ts">
const current = useFlowAccount();
</script>

<template>
  <FlowConnectButton v-if="!current?.loggedIn" />
  <button v-else class="mb-0 rounded-full">
    BUTTON
  </button>
</template>
