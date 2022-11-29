<script setup lang="ts">
import FlowLogo from '~/assets/svgs/flow.svg'
import { FireIcon, Squares2X2Icon, ChartBarSquareIcon } from "@heroicons/vue/24/solid";

const router = useRouter()
const route = useRoute()

function isCurrentInActivePage(pageKey: string): boolean {
  return !route.path.startsWith(`/${pageKey}`)
}
</script>

<template>
  <header class="container">
    <nav>
      <ul>
        <li class="inline-flex-between cursor-pointer" @click="() => {
          router.push('/');
        }">
          <FlowLogo class="fill-white w-10 h-10" />
          <span class="font-semibold text-2xl">Flow Dev Explorer</span>
        </li>
      </ul>
      <ul>
        <li class="flex-center">
          <NuxtLink to="/active" :class="['inline-flex-between', { secondary: isCurrentInActivePage('active') }]">
            <FireIcon class="fill-secondary w-6 h-6" />
            Competition
          </NuxtLink>
        </li>
        <li class="flex-center">
          <NuxtLink to="/communities" :class="['inline-flex-between', { secondary: isCurrentInActivePage('communities') }]">
            <Squares2X2Icon class="fill-current w-6 h-6" />
            Communities
          </NuxtLink>
        </li>
        <li class="flex-center">
          <NuxtLink to="/leaderboard" :class="['inline-flex-between', { secondary: isCurrentInActivePage('leaderboard') }]">
            <ChartBarSquareIcon class="fill-current w-6 h-6" />
            Leaderboard
          </NuxtLink>
        </li>
        <li>
          <WidgetThemeToggle />
        </li>
        <li>
          <FlowConnect />
        </li>
        <li>
          <AuthGithub />
        </li>
      </ul>
    </nav>
  </header>
</template>
