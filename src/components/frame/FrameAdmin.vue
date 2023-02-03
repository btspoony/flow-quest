<script setup lang="ts">
withDefaults(defineProps<{
  noTopbar?: boolean
}>(), {
  noTopbar: false
});
const user = useUserProfile()

const inAdmin = useAppStatusInAdmin()

onMounted(() => {
  inAdmin.value = true
})

onUnmounted(() => {
  inAdmin.value = false
})

function sendClaimAdminResource(): Promise<string> {
  const { $transactions } = useNuxtApp();
  return $transactions.adminInitialize()
}
</script>

<template>
  <FrameMain :no-topbar="noTopbar">
    <div v-if="!user?.adminStatus?.valid || !user?.adminStatus?.enabled" class="hero">
      <div class="hero-content flex-col text-center">
        <span v-if="!user?.adminStatus?.valid">Cannot access to the admin page</span>
        <template v-else-if="!user?.adminStatus?.enabled">
          <div class="headings mb-2">
            <h3>Initialize Admin</h3>
            <p>Claim an admin resource to manage content.</p>
          </div>
          <FlowSubmitTransaction :method="sendClaimAdminResource"
            @success="reloadCurrentUser({ ignoreIdentities: true, ignoreSeason: true })">
            <span class="px-12">Claim</span>
          </FlowSubmitTransaction>
        </template>
      </div>
    </div>
    <template v-else>
      <slot />
    </template>
  </FrameMain>
</template>
