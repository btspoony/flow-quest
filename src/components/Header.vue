<script setup lang="ts">
import FlowLogo from '~/assets/svgs/flow.svg'
import { FireIcon, Squares2X2Icon, ChartBarSquareIcon } from "@heroicons/vue/24/solid";

const router = useRouter()
const route = useRoute()

const config = useRuntimeConfig();
const appName = ref(config.public.appName)

function isCurrentInActivePage(pageKey: string): boolean {
  return !route.path.startsWith(`/${pageKey}`)
}
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-[var(--background-color)]">
    <nav class="container">
      <ul>
        <li class="inline-flex-between cursor-pointer" @click="() => router.push(geneReferralLinkObject('/'))">
          <FlowLogo class="fill-white w-10 h-10" />
          <span class="font-semibold text-2xl">{{ appName }}</span>
        </li>
      </ul>
      <ul>
        <li class="flex-center">
          <NuxtLink :to="geneReferralLink('/active')"
            :class="['inline-flex-between', { secondary: isCurrentInActivePage('active') }]">
            <FireIcon class="fill-secondary w-6 h-6" />
            Competition
          </NuxtLink>
        </li>
        <!--
        <li class="flex-center">
          <NuxtLink :to="geneReferralLink('/communities')"
            :class="['inline-flex-between', { secondary: isCurrentInActivePage('communities') }]">
            <Squares2X2Icon class="fill-current w-6 h-6" />
            Communities
          </NuxtLink>
        </li> -->

        <li class="flex-center">
          <NuxtLink :to="geneReferralLink('/leaderboard')"
            :class="['inline-flex-between', { secondary: isCurrentInActivePage('leaderboard') }]">
            <ChartBarSquareIcon class="fill-current w-6 h-6" />
            Leaderboard
          </NuxtLink>
        </li>
        <li>
          <WidgetThemeToggle />
        </li>
        <li>
          <AuthHeader />
        </li>
      </ul>
    </nav>
  </header>
</template>
