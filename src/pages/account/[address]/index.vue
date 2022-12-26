<script setup lang="ts">
const profile = useCurrentProfile()

interface BountyStatus {
  id: string
  completedAt: Date
}

const completedBounties = computed<BountyStatus[]>(() => {
  if (profile.value?.activeRecord?.bountiesCompleted) {
    const bounties: BountyStatus[] = []
    const bountiesDic = profile.value?.activeRecord?.bountiesCompleted
    for (const key in bountiesDic) {
      bounties.push({ id: key, completedAt: new Date(parseInt(bountiesDic[key]) * 1000) })
    }
    return bounties
  }
  return []
})
</script>

<template>
  <section class="hero">
    <div class="hero-content">
      <span class="text-xl">
        <span class="font-bold">{{ profile?.activeRecord?.points }}</span>&nbsp;Point
      </span>
      <span>
        <span class="text-lg font-bold">{{ completedBounties.length }}</span>
        Quests completed
      </span>
    </div>
  </section>
</template>
