<script setup lang="ts">
defineProps<{
  challenge: ChallengeConfig
}>();
</script>

<template>
  <div class="card card-border non-interactive p-4">
    <span class="tag">{{ challenge.key }}</span>
    <details class="mt-4 mb-0 border-b-0">
      <summary>
        <div class="w-[80%] inline-flex items-center justify-between">
          <span><b>Title: </b>{{ challenge.key }}</span>
          <span><b>Quest Amount: </b>{{ challenge.quests.length }}</span>
        </div>
      </summary>
      <div class="flex flex-col gap-2">
        <div>
          <h5 class="mb-2">Quests: </h5>
          <div class="flex flex-wrap gap-4 basis-1/2 md:basis-1/3 lg:basis-1/4 ">
            <span v-for="one in challenge.quests" :key="one.key" class="tag">{{ one.key }}</span>
          </div>
        </div>
        <div v-if="challenge.achievement">
          <h5 class="mb-2">Achievement: </h5>
          <ItemFLOATEvent :host="challenge.achievement.host" :event-id="challenge.achievement.eventId" />
        </div>
      </div>
    </details>
  </div>
</template>
