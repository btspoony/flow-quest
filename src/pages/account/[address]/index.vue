<script setup lang="ts">
const profile = useCurrentAccountProfile()
</script>

<template>
  <template v-if="profile">
    <SectionProfileScore :profile="profile" />
    <SectionProfileReferral :profile="profile" @reload="reloadCurrentProfile(profile?.address!)" />
  </template>
  <div v-else class="hero">
    <div class="hero-content"><span class="text-4xl text-center">No Profile Data</span></div>
  </div>
</template>
