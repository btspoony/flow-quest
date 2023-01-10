<script setup lang="ts">
const cfg = useRuntimeConfig()
const isTestnet = ref(cfg.public.network === 'testnet')

async function onRemoveProfile(): Promise<string> {
  const { $fcl } = useNuxtApp()
  const config = useRuntimeConfig()
  const txid = $fcl.mutate({
    cadence: `
import UserProfile from ${config.public.flowServiceAddress}
import Community from ${config.public.flowServiceAddress}

transaction {
    prepare(acct: AuthAccount) {
        // SETUP profile resource and link public
        if acct.borrow<&UserProfile.Profile>(from: UserProfile.ProfileStoragePath) != nil {
            let profile <- acct.load<@UserProfile.Profile>(from: UserProfile.ProfileStoragePath)
            destroy profile
            acct.unlink(UserProfile.ProfilePublicPath)
        }

        // remove old
        if acct.borrow<&Community.CommunityBuilder>(from: Community.CommunityStoragePath) != nil {
            let builder <- acct.load<@Community.CommunityBuilder>(from: Community.CommunityStoragePath)
            destroy builder
            acct.unlink(Community.CommunityPublicPath)
        }
    }
}
    `
  })
  return txid
}

async function onRemoveAdmin(): Promise<string> {
  const { $fcl } = useNuxtApp()
  const config = useRuntimeConfig()
  const txid = $fcl.mutate({
    cadence: `
import CompetitionService from ${config.public.flowServiceAddress}

transaction {
    prepare(acct: AuthAccount) {
        if acct.borrow<&CompetitionService.CompetitionAdmin>(from: CompetitionService.AdminStoragePath) != nil {
            let admin <- acct.load<@CompetitionService.CompetitionAdmin>(from: CompetitionService.AdminStoragePath)
            destroy admin
        }
    }
}
    `
  })
  return txid
}

</script>

<template>
  <main v-if="isTestnet" class="mt-20 p-8 flex flex-col gap-4">
    <FlowSubmitTransaction :method="onRemoveProfile" content="Remove Profile" />
    <FlowSubmitTransaction :method="onRemoveAdmin" content="Remove Admin" />
  </main>
</template>
