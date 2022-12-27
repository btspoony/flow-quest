<script setup lang="ts">
withDefaults(defineProps<{
  noTopbar?: boolean
}>(), {
  noTopbar: false
});
const github = useGithubProfile();
</script>

<template>
  <main class="w-full mx-auto">
    <div v-if="!noTopbar" class="h-[90px]"></div>
    <slot name="header" />
    <div class="relative container min-h-[calc(100vh-180px)]">
      <div class="hero" v-if="!github.auth">
        <div class="page-container hero-content flex-col">
          <h4>Start Challenges</h4>
          <p>Login with Github to start the challenge tour</p>
          <AuthGithubButton />
        </div>
      </div>
      <template v-else>
        <slot />
      </template>
    </div>
  </main>
</template>
