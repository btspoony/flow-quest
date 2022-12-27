<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import FlowLogo from '~/assets/svgs/flow.svg';
import { Bars3Icon } from "@heroicons/vue/24/solid";

const router = useRouter()

const config = useRuntimeConfig();
const appName = ref(config.public.appName)

const menuHidden = ref(false)

onMounted(() => {
  const { width } = useWindowSize()
  watchEffect(() => {
    menuHidden.value = width.value < 1024
  })
})
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-[var(--background-color)]">
    <nav class="container">
      <ul>
        <li class="inline-flex-between !gap-2 cursor-pointer" @click="() => router.push(geneReferralLinkObject('/'))">
          <FlowLogo class="fill-white w-10 h-10" />
          <span class="font-semibold text-2xl hidden lg:inline">{{ appName }}</span>
        </li>
      </ul>
      <ul>
        <Menus v-if="!menuHidden" />
        <li>
          <WidgetThemeToggle />
        </li>
        <li>
          <AuthHeader />
        </li>
        <li class="cursor-pointer" v-if="menuHidden">
          <label for="page-drawer">
            <Bars3Icon class="fill-current w-6 h-6" />
          </label>
        </li>
      </ul>
    </nav>
  </header>
</template>
