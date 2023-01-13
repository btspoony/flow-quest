<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { Icon } from '@iconify/vue';

const user = useUserProfile()
const props = defineProps<{
  profile: ProfileData
}>()
const season = useActiveSeason();

const isUserSelf = computed<boolean>(() => user.value?.address === props.profile.address)
const referralCode = computed<string | undefined>(() => props.profile.activeRecord?.referralCode)
const copyURL = computed<string>(() => {
  let host: string
  if (process.client) {
    host = `${window.location.protocol}//${window.location.host}/`
  } else {
    host = '/'
  }
  return referralCode.value ? `${host}?referral=${referralCode.value}` : host
});
const { text, copy, copied, isSupported } = useClipboard();

const executable = computed<boolean>(() => season.value ? season.value?.referralThreshold <= (props.profile.activeRecord?.points ?? 0) : false)

async function generateCode(): Promise<string | null> {
  const result = await apiPostGenerateReferralCode()
  if (result) {
    if (result.transactionId) {
      return result.transactionId
    }
    if (result.error && result.error.message) {
      throw new Error(`[ErrCode:${result.error.code}] ${result.error.message}`)
    }
    if (!result.isAccountValid) {
      throw new Error("Account verification invalid")
    }
    if (!result.isPointsEnough) {
      throw new Error("Points not enough")
    }
  } else {
    throw new Error("Failed to requeset")
  }
  return null
}

const emit = defineEmits<{
  (e: 'reload'): void;
}>();

</script>

<template>
  <section v-if="referralCode || isUserSelf" class="hero card card-border">
    <div class="hero-content flat w-[90%] align-start flex-col">
      <div class="w-full flex-between flex-wrap text-4xl font-semibold">
        <span class="py-2">Referral Code</span>
        <span v-if="referralCode" class="rounded-full bg-secondary text-white px-4 py-2">
          <span class="font-extrabold">{{ referralCode ?? "UNKNOWN" }}</span>
        </span>
      </div>
      <div class="divider"></div>
      <div class="w-full text-xl flex flex-col gap-2">
        <template v-if="referralCode">
          <span>To obtain more points by inviting friends</span>
          <code class="inline-flex-between text-sm" :data-tooltip="copied ? `${text} copied` : undefined">
            <span>{{ copyURL }}</span>
            <Icon icon="heroicons:clipboard-document" v-if="isSupported" class="w-5 h-5 cursor-pointer" @click="copy(copyURL)" />
          </code>
        </template>
        <FlowSubmitTransaction v-else-if="isUserSelf" :disabled="!executable" :method="generateCode"
          @sealed="emit('reload')">
          Generate Referral Code
          <template v-slot:disabled>
            <div class="inline-flex-between">
              Obtain more than <b class="tag">{{ season?.referralThreshold }}</b> points to generate referral
              code
            </div>
          </template>
        </FlowSubmitTransaction>
      </div>
    </div>
  </section>
</template>
