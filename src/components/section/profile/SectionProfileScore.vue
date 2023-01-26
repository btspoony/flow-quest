<script setup lang="ts">
const props = defineProps<{
  profile: ProfileData
}>()

interface BountyStatus {
  id: string
  completedAt: Date
}

const completedBounties = computed<BountyStatus[]>(() => {
  if (props.profile.activeRecord?.bountiesCompleted) {
    const bounties: BountyStatus[] = []
    const bountiesDic = props.profile.activeRecord?.bountiesCompleted
    for (const key in bountiesDic) {
      bounties.push({ id: key, completedAt: new Date(parseInt(bountiesDic[key]) * 1000) })
    }
    return bounties
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
          <span class="font-extrabold">{{ profile.activeRecord?.points }}</span>&nbsp;Points
        </span>
      </div>
      <div class="divider"></div>
      <div class="text-xl">
        Total
        <span class="font-extrabold">{{ completedBounties.length }} Missions</span>
        completed
      </div>
    </div>
  </section>
</template>
