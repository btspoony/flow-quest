<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import FlowLogo from '~/assets/svgs/flow.svg'
import { FireIcon, Bars3Icon, ChartBarSquareIcon } from "@heroicons/vue/24/solid";

const router = useRouter()
const route = useRoute()

const config = useRuntimeConfig();
const appName = ref(config.public.appName)

function isCurrentInActivePage(pageKey: string): boolean {
  return !route.path.startsWith(`/${pageKey}`)
}

const { width } = useWindowSize()
const menuHidden = computed(() => width.value < 1024)
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-[var(--background-color)]">
    <nav class="container">
      <ul>
        <li class="inline-flex-between !gap-2 cursor-pointer" @click="() => router.push(geneReferralLinkObject('/'))">
          <FlowLogo class="fill-white w-10 h-10" />
          <span v-if="!menuHidden" class="font-semibold text-2xl">{{ appName }}</span>
        </li>
      </ul>
      <ul>
        <template v-if="!menuHidden">
          <li class="flex-center">
            <NuxtLink :to="geneReferralLink('/active')"
              :class="['inline-flex-between', { secondary: isCurrentInActivePage('active') }]">
              <FireIcon class="fill-secondary w-6 h-6" />
              Competition
            </NuxtLink>
          </li>
          <li class="flex-center">
            <NuxtLink :to="geneReferralLink('/leaderboard')"
              :class="['inline-flex-between', { secondary: isCurrentInActivePage('leaderboard') }]">
              <ChartBarSquareIcon class="fill-current w-6 h-6" />
              Leaderboard
            </NuxtLink>
          </li>
        </template>
        <li>
          <WidgetThemeToggle />
        </li>
        <li>
          <AuthHeader />
        </li>
        <li class="cursor-pointer" v-if="menuHidden">
          <Bars3Icon class="fill-current w-6 h-6" />
        </li>
      </ul>
    </nav>
  </header>
</template>
