<script setup lang="ts">
const profile = useCurrentProfile()
const season = useActiveSeason();
</script>

<template>
  <template v-if="season && profile">
    <ItemProfileScore :profile="profile" />
    <ItemProfileReferral :profile="profile" @reload="reloadCurrentProfile(profile?.address)" />
  </template>
  <div v-else class="hero">
    <div class="hero-content"><span class="text-4xl text-center">No Active Season</span></div>
  </div>
</template>
