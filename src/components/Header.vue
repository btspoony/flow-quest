<script setup lang="ts">
import FlowLogo from '~/assets/svgs/flow.svg'

const router = useRouter()
</script>

<template>
  <header class="container">
    <nav>
      <ul>
        <li class="inline-flex-between cursor-pointer" @click="() => {
          router.push('/');
        }">
          <FlowLogo class="fill-white w-10 h-10" />
          <span class="font-semibold text-2xl">Flow Dev Challenges</span>
        </li>
      </ul>
      <ul>
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
