<script setup lang="ts">
import md from 'markdown-it';
defineProps<{
  mission: MissionConfig | MissionConfigRequest
}>();

const mdRenderer = md({ html: true })
</script>

<template>
  <div class="card card-border non-interactive p-4">
    <span class="tag">{{ mission.key }}</span>
    <details class="mt-4 mb-0 border-b-0">
      <summary>
        <div class="w-[80%] inline-flex items-center justify-between">
          <span><b>Title: </b>{{ (mission as MissionConfigRequest).name ?? (mission as MissionConfig).display.name }}</span>
          <span><b>Steps: </b>{{ mission.steps }}</span>
        </div>
      </summary>
      <div class="flex flex-col gap-2">
        <h6 class="mb-0">Description: </h6>
        <div class="prose-sm prose-blockquote:py-0 prose-img:my-0"
          v-html="mdRenderer.render((mission as MissionConfigRequest).description ?? (mission as MissionConfig).display.description)">
        </div>
        <h6 class="mb-0">Config JSON: </h6>
        <NuxtLink :to="mission.stepsCfg" target="_blank">
          {{ mission.stepsCfg }}
        </NuxtLink>
      </div>
    </details>
  </div>
</template>
