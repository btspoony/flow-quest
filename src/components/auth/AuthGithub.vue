<script setup lang="ts">
const profile = useGithubProfile();
const loading = ref(false);

watchEffect(async () => {
  if (profile.value.auth) {
    loading.value = true

    const data: any = await $fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${profile.value.auth?.accessToken}`
      }
    })
    if (typeof data === 'object') {
      profile.value.data = {
        id: data.id,
        userName: data.login,
        displayName: data.name,
        avatarUrl: data.avatar_url,
        email: data.email,
        bio: data.bio,
        location: data.location,
        public_repos: data.public_repos,
        public_gists: data.public_gists,
        followers: data.followers,
        following: data.following,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      }
    }

    loading.value = false
  }
})
</script>

<template>
  <div>
    <div v-if="profile.auth" class="inline-flex-between">
      <span v-if="!profile.data || loading" :aria-busy="loading">
        Loading
      </span>
      <WidgetProfileHead v-else />
    </div>
    <AuthGithubButton v-else />
  </div>
</template>
