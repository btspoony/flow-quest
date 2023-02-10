<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type WidgetDialog from '../../widget/WidgetDialog.vue';
import type ItemMissionVerifierGithub from './verifier/ItemMissionVerifierGithub.vue';

const dialog = ref<InstanceType<typeof WidgetDialog> | null>(null);
const githubVerifier = ref<InstanceType<typeof ItemMissionVerifierGithub> | null>(null);

const props = defineProps<{
  mission: BountyInfo,
  step: number,
  stepsCfg: MissionStepsConfig[]
  isCompleted: boolean,
  isLocked: boolean,
}>()

const emit = defineEmits<{
  (e: 'success'): void
}>()

const submitLoading = ref(false);
const stepCfg = computed(() => props.stepsCfg[props.step]);
const maxAnswerLength = computed(() => stepCfg.value.type === 'onchain'
  ? stepCfg.value.schema.length
  : stepCfg.value.type === 'quiz'
    ? stepCfg.value.quiz.length
    : stepCfg.value.type === 'github'
      ? 1 : 0
)
const answers = reactive<string[][]>(Array(maxAnswerLength.value).fill([]));

provide(missionGithubVerifyInjectKey, {
  repos: computed<string[]>(() => stepCfg.value.type === 'github'
    ? stepCfg.value.repos
    : []
  ),
  updateValidRepos: (repos: string[]) => {
    if (stepCfg.value.type === 'github') {
      answers[0] = repos
    }
  }
})

const currentMissionIdx = ref(0);
const currentMissionCfg = computed(() => stepCfg.value.type === 'quiz' ? stepCfg.value.quiz[currentMissionIdx.value] : undefined);
const currentMissionOptions = computed(() => {
  if (!currentMissionCfg.value) return []
  return shuffleArray(currentMissionCfg.value.options.map((one, i) => Object.assign({}, one, { i })))
});
const isLastQuizMission = computed(() => stepCfg.value.type === 'quiz' ? currentMissionIdx.value === stepCfg.value.quiz.length - 1 : false)
const isAnswerTotallyCorrect = computed(() => {
  if (!currentMissionCfg.value) return false
  return currentMissionCfg.value.type === 'radio'
    ? answers[currentMissionIdx.value][0] === currentMissionCfg.value.answer
    : isSameArray(toRaw(answers[currentMissionIdx.value]).filter(o => !!o), currentMissionCfg.value.answer.split(','))
});

function isSelectedQuizAnswer(index: number) {
  const option = currentMissionCfg.value?.options[index]
  if (!option) return false
  return answers[currentMissionIdx.value]?.indexOf(option.key) > -1
}

function isTheQuizAnswerCorrect(index: number) {
  if (!currentMissionCfg.value) return false
  const option = currentMissionCfg.value.options[index]
  return currentMissionCfg.value.type === 'radio'
    ? currentMissionCfg.value.answer === option.key
    : currentMissionCfg.value.answer.split(',').indexOf(option.key) > -1
}

function onOpenDialogue() {
  for (let i = 0; i < maxAnswerLength.value; i++) {
    answers[i] = [""]
  }
  dialog.value?.openModal()
  if (stepCfg.value.type === 'github') {
    githubVerifier.value?.execute()
  }
}

const isAnswerCompleted = computed(() => {
  return answers.filter(one => one.filter(a => !!a).length === 0).length === 0
})

async function onSubmitAnswer(): Promise<string | null> {
  submitLoading.value = true

  let params: { key: string, value: string }[] = []
  switch (stepCfg.value.type) {
    case 'onchain':
      params = stepCfg.value.schema.map((param, index) => {
        return { key: param.key, value: answers[index][0] }
      })
      break;
    case 'quiz':
      params = answers.map((val, i) => ({ key: `${i}`, value: toRaw(val).filter(o => !!o).sort().join(',') }))
      break;
    case 'github':
      const github = useGithubProfile()
      if (github.value.auth) {
        params = [
          { key: '_accessToken', value: github.value?.auth?.accessToken },
          { key: 'repos', value: answers[0].join(',') }
        ]
      }
      break
  }

  const result = await apiPostVerifyMission(
    props.mission.config,
    props.step,
    params
  )
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
    if (!result.isMissionValid) {
      throw new Error("Mission verification invalid")
    }
  } else {
    throw new Error("Failed to requeset")
  }
  return null
}

function resetComp() {
  submitLoading.value = false
}

function onCloseDialgue() {
  dialog.value?.closeModal()
}

</script>

<template>
  <div class="card card-border p-4 flex items-center justify-between gap-2">
    <div :class="['flex-none', isLocked ? 'opacity-50' : '']">
      <span v-if="!isCompleted" class="rounded-full inline-block w-8 h-8 flex-center bg-gray-200 dark:bg-gray-800">
        {{ step + 1 }}
      </span>
      <Icon icon="heroicons:check-circle-20-solid" v-else class="text-success w-8 h-8" inline />
    </div>
    <div :class="['flex-auto', isCompleted ? 'line-through' : 'font-semibold', isLocked ? 'opacity-50' : '']">
      {{ stepCfg?.title ?? "" }}
    </div>
    <div class="flex-none min-w-[120px] flex gap-2">
      <template v-if="(!isLocked && !isCompleted)">
        <button class="mb-0 rounded-full" data-target="modal-dialog"
          @click.stop.prevent="onOpenDialogue">
          <span class="font-semibold">
            {{ stepCfg.type === 'quiz' ? 'Quiz' : 'Verify' }}
          </span>
        </button>
        <a v-if="typeof stepCfg.external === 'string'" :href="stepCfg.external" role="button" class="mb-0 rounded-full outline"
          target="_blank">
          ⇱ View
        </a>
      </template>
    </div>
  </div>
  <WidgetDialog ref="dialog" :locked="submitLoading">
    <div class="flex-center flex-col">
      <template v-if="stepCfg.type === 'onchain'">
        <div class="headings">
          <h3 class="w-full text-center">Submit your answer</h3>
          <small>{{ stepCfg.description }}</small>
        </div>
        <div class="flex flex-col gap-1">
          <template v-for="(param, index) in stepCfg.schema" :key="`key_${index}`">
            <label :for="`${mission.id}_${step}_param_${param.key}`">
              <span class="text-lg font-semibold">{{ param.label ?? param.key }}</span>
              <input type="text" :id="`${mission.id}_${step}_param_${param.key}`" :name="`${mission.id}_${step}_param_${param.key}`"
                :placeholder="param.type" v-model="answers[index][0]" required>
            </label>
          </template>
        </div>
      </template>
      <template v-else-if="stepCfg.type === 'quiz' && currentMissionCfg">
        <small>Question {{ currentMissionIdx + 1 }} of {{ stepCfg.quiz.length }}</small>
        <h4 class="w-full text-center mb-4">{{ currentMissionCfg.question }}</h4>
        <div class="w-full px-4 py-2 flex flex-col gap-2">
          <img v-if="currentMissionCfg.image" class="object-contain justify-items-center max-h-32"
            :src="getIPFSUrl(currentMissionCfg.image)" alt="question alt" />
          <template v-for="option in currentMissionOptions" :key="`quiz_${currentMissionIdx}_${option.i}`">
            <label :for="`${mission.id}_${step}_quiz_${currentMissionIdx}_${option.i}`"
              :class="['card card-border overflow-x-scroll overflow-y-clip border-2 p-4',{
                '!border-success bg-success/10': isSelectedQuizAnswer(option.i) && isTheQuizAnswerCorrect(option.i),
                '!border-failure bg-failure/10': isSelectedQuizAnswer(option.i) && !isTheQuizAnswerCorrect(option.i)
              }]">
              <input v-if="currentMissionCfg.type === 'radio'" type="radio"
                :id="`${mission.id}_${step}_quiz_${currentMissionIdx}_${option.i}`" :value="option.key"
                v-model="answers[currentMissionIdx][0]"
                :aria-invalid="isSelectedQuizAnswer(option.i) ? !isTheQuizAnswerCorrect(option.i) : undefined"
                :disabled="submitLoading" />
              <input v-else type="checkbox"
                :id="`${mission.id}_${step}_quiz_${currentMissionIdx}_${option.i}`" :value="option.key" v-model="answers[currentMissionIdx]"
                :aria-invalid="isSelectedQuizAnswer(option.i) ? !isTheQuizAnswerCorrect(option.i) : undefined"
                :disabled="submitLoading" />
              {{ option.description }}
            </label>
          </template>
        </div>
      </template>
      <ItemMissionVerifierGithub ref="githubVerifier" v-else-if="stepCfg.type === 'github'" />
    </div>
    <footer class="mt-4">
      <button v-if="stepCfg.type === 'quiz' && !isLastQuizMission" class="rounded-xl flex-center mb-0"
        :disabled="!isAnswerTotallyCorrect" @click.stop.prevent="() => currentMissionIdx++">
        {{ isAnswerTotallyCorrect ? 'Next Mission' : 'Incorrect 🙅‍♀️' }}
      </button>
      <FlowSubmitTransaction v-else-if="stepCfg.type !== 'quiz' || isLastQuizMission"
        :disabled="!isAnswerCompleted || (stepCfg.type === 'quiz' && !isAnswerTotallyCorrect)" :method="onSubmitAnswer"
        @sealed="resetComp()"
        @error="resetComp()"
        @success="emit('success')"
        @reset="onCloseDialgue()"
      >
        Submit
        <template v-slot:disabled>
          {{ stepCfg.type === 'onchain' ? 'Missing Parameters' : 'Invalid to Submit' }}
        </template>
      </FlowSubmitTransaction>
    </footer>
  </WidgetDialog>
</template>
