<script setup lang="ts">
import { Icon } from '@iconify/vue';
import FlowLogo from '~/assets/svgs/flow.svg';

const props = defineProps<{
  season: CompetitionSeason
}>()

const wallet = useFlowAccount()
const user = useUserProfile()

const isLoggedIn = computed(() => wallet?.value?.loggedIn && user?.value?.profileRecord)

interface RankdingRewardInfo {
  rankings: string[];
  reward: string;
  currency: string;
}

const parsedRewardsInfo = computed<RankdingRewardInfo[]>(() => {
  if (!props.season.rankingRewards) return []

  const rewards = props.season.rankingRewards.split(',')
  const rewardStrReg = /(\d+)(~(\d+))?:(\d+)\$(\w+)/i
  return rewards.filter(one => rewardStrReg.test(one))
    .map(one => {
      const matched = rewardStrReg.exec(one)
      if (matched) {
        const rankings = [matched[1]]
        if (matched[3]) {
          rankings.push(matched[3])
        }
        return {
          rankings,
          reward: matched[4],
          currency: matched[5]
        }
      } else {
        throw new Error('unmatched')
      }
    })
})
</script>

<template>
<div class="w-full mb-4 min-w-fit">
  <div class="mb-4">
    <h3 class="mb-0">{{ season.title ?? "Hot!" }}</h3>
    <WidgetEndTime v-if="season.endDate" :deadline="season.endDate" class="w-fit text-xs">Season</WidgetEndTime>
  </div>
  <div v-if="parsedRewardsInfo.length > 0 || isLoggedIn"
    class="card card-border non-interactive p-4 flex flex-col gap-2">
    <div class="flex flex-wrap items-center gap-2">
      <div v-if="parsedRewardsInfo.length > 0" class="tag success w-fit flex items-center gap-1">
        <Icon icon="heroicons:trophy-solid" class="w-4 h-4" />
        <span>Ranking Rewards</span>
      </div>
      <small class="text-xs" v-if="isLoggedIn">
        You can earn <b class="text-secondary">extra points</b> in the active season from your friends who invited by
        your
        <NuxtLink :to="geneReferralLink(`/account/${user?.address}`)"><b>Referral Code</b></NuxtLink>
      </small>
    </div>
    <div v-if="parsedRewardsInfo.length > 0" class="flex flex-wrap items-center justify-start">
      <div v-for="one, i in parsedRewardsInfo" :key="`rankingReward${i}`"
        :class="['flex items-center justify-start gap-2', one.rankings[1] ? 'basis-full lg:basis-1/2' : 'basis-full md:basis-1/2 lg:basis-1/3']">
        <div class="relative w-14 h-14 flex-center" v-if="!one.rankings[1]">
          <ItemLeaderboardRank class="flex-none z-10" :rank="i + 1" :label="one.rankings[0]" />
          <Icon icon="heroicons:trophy-solid" class="absolute left-1 top-1 w-12 h-12 opacity-20" />
        </div>
        <div v-else class="w-fit py-1 flex-center gap-2">
          <span class="tag">
            Rank {{ one.rankings[0] }}
          </span>
          ~
          <span class="tag">
            Rank {{ one.rankings[1] }}
          </span>
        </div>
        <FlowLogo class="fill-white w-5 h-5" v-if="one.currency.toUpperCase() === 'FLOW'" />
        <span class="text-lg font-semibold">{{ one.reward }} ${{ one.currency.toUpperCase() }}</span>
      </div>
    </div>
  </div>
</div>
</template>
