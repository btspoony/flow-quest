<script setup lang="ts">
const github = useGithubProfile();
const user = useUserProfile()
</script>

<template>
  <AuthPlatformGithubButton v-if="!github.auth" />
  <FlowConnect v-else-if="!user?.profileRecord" />
</template>
