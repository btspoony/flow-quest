<script setup lang="ts">
defineProps<{
  mission: MissionConfig | MissionConfigRequest
}>();
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
      <div>
        <b>Description: </b><br />
        {{ (mission as MissionConfigRequest).description ?? (mission as MissionConfig).display.description }}
      </div>
      <div>
        <b>Config JSON: </b><br />{{ mission.stepsCfg }}
      </div>
    </details>
  </div>
</template>
