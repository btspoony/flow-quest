<script setup lang="ts">
const props = defineProps<{
  profile: ProfileData
}>()

const completedMissions = computed<string[]>(() => {
  if (props.profile.profileRecord?.missionScores) {
    const completedMissions: string[] = []
    const scores = props.profile.profileRecord?.missionScores
    for (const key in scores) {
      const one = scores[key]
      if (one.completed) {
        completedMissions.push(key)
      }
    }
    return completedMissions
  }
  return []
})
</script>

<template>
  <section class="hero card card-border">
    <div class="hero-content flat w-[90%] align-start flex-col !gap-6">
      <div class="w-full flex-between flex-wrap text-4xl font-semibold">
        <span class="py-2">Score</span>
        <span class="rounded-full bg-secondary text-white px-4 py-2">
          <span class="font-extrabold">{{ profile.profileRecord?.points }}</span>&nbsp;Points
        </span>
      </div>
      <div class="divider"></div>
      <div class="text-xl">
        Total
        <span class="font-extrabold">{{ completedMissions.length }} Missions</span>
        completed
      </div>
    </div>
  </section>
</template>
