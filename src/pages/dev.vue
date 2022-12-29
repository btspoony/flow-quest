<script setup lang="ts">
const cfg = useRuntimeConfig()
const isTestnet = ref(cfg.public.network === 'testnet')

async function onRemoveProfile(): Promise<string> {
  const { $fcl } = useNuxtApp()
  const config = useRuntimeConfig()
  const txid = $fcl.mutate({
    cadence: `
import UserProfile from ${config.public.flowServiceAddress}

transaction {
    prepare(acct: AuthAccount) {
        // SETUP profile resource and link public
        if acct.borrow<&UserProfile.Profile>(from: UserProfile.ProfileStoragePath) != nil {
            let profile <- acct.load<@UserProfile.Profile>(from: UserProfile.ProfileStoragePath)
            destroy profile
            acct.unlink(UserProfile.ProfilePublicPath)
        }
    }
}
    `
  })
  return txid
}

</script>

<template>
  <main class="mt-20 p-8 flex flex-col gap-4">
    <section v-if="isTestnet">
      <FlowSubmitTransaction :method="onRemoveProfile" content="Remove Profile" />
    </section>
  </main>
</template>
