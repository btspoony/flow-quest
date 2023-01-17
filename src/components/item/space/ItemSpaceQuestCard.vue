<script setup lang="ts">
defineProps<{
  quest: QuestConfig | QuestConfigRequest
}>();
</script>

<template>
  <div class="card card-border non-interactive p-4">
    <span class="tag">{{ quest.key }}</span>
    <details class="mt-4 mb-0 border-b-0">
      <summary>
        <div class="w-[80%] inline-flex items-center justify-between">
          <span><b>Title: </b>{{ (quest as QuestConfigRequest).name ?? (quest as QuestConfig).display.name }}</span>
          <span><b>Steps: </b>{{ quest.steps }}</span>
        </div>
      </summary>
      <div><b>Config JSON: </b><br />{{ quest.stepsCfg }}</div>
    </details>
  </div>
</template>
