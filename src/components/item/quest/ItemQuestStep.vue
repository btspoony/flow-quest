<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type WidgetDialog from '../../widget/WidgetDialog.vue';
const dialog = ref<InstanceType<typeof WidgetDialog> | null>(null);

const props = defineProps<{
  quest: BountyInfo,
  step: number,
  stepsCfg: QuestStepsConfig[]
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
  : stepCfg.value.quiz.length
)
const answers = reactive<string[][]>(Array(maxAnswerLength.value).fill([]));

const currentQuestIdx = ref(0);
const currentQuestCfg = computed(() => stepCfg.value.type === 'quiz' ? stepCfg.value.quiz[currentQuestIdx.value] : undefined);
const currentQuestOptions = computed(() => {
  if (!currentQuestCfg.value) return []
  return shuffleArray(currentQuestCfg.value.options.map((one, i) => Object.assign({}, one, { i })))
});
const isLastQuizQuestion = computed(() => stepCfg.value.type === 'quiz' ? currentQuestIdx.value === stepCfg.value.quiz.length - 1 : false)
const isAnswerTotallyCorrect = computed(() => {
  if (!currentQuestCfg.value) return false
  return currentQuestCfg.value.type === 'radio'
    ? answers[currentQuestIdx.value][0] === currentQuestCfg.value.answer
    : isSameArray(toRaw(answers[currentQuestIdx.value]).filter(o => !!o), currentQuestCfg.value.answer.split(','))
});

function isSelectedQuizAnswer(index: number) {
  const option = currentQuestCfg.value?.options[index]
  if (!option) return false
  return answers[currentQuestIdx.value]?.indexOf(option.key) > -1
}

function isTheQuizAnswerCorrect(index: number) {
  if (!currentQuestCfg.value) return false
  const option = currentQuestCfg.value.options[index]
  return currentQuestCfg.value.type === 'radio'
    ? currentQuestCfg.value.answer === option.key
    : currentQuestCfg.value.answer.split(',').indexOf(option.key) > -1
}

function onOpenDialogue() {
  let len
  if (stepCfg.value.type === 'onchain') {
    len = stepCfg.value.schema.length
  } else {
    len = stepCfg.value.quiz.length
    currentQuestIdx.value = 0
  }
  for (let i = 0; i < len; i++) {
    answers[i] = [""]
  }
  dialog.value?.openModal()
}

const isAnswerCompleted = computed(() => {
  return answers.filter(one => one.filter(a => !!a).length === 0).length === 0
})

async function onSubmitAnswer(): Promise<string | null> {
  submitLoading.value = true
  const result = await apiPostVerifyQuest(
    props.quest.config,
    props.step,
    stepCfg.value.type === 'onchain'
      ? stepCfg.value.schema.map((param, index) => {
        return { key: param.key, value: answers[index][0] }
      })
      : answers.map((val, i) => ({ key: `${i}`, value: toRaw(val).filter(o => !!o).sort().join(',') }))
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
    if (!result.isQuestValid) {
      throw new Error("Quest verification invalid")
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
            {{ stepCfg.type === 'onchain' ? 'Verify' : 'Quiz' }}
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
            <label :for="`${quest.id}_${step}_param_${param.key}`">
              <span class="text-lg font-semibold">{{ param.label ?? param.key }}</span>
              <input type="text" :id="`${quest.id}_${step}_param_${param.key}`" :name="`${quest.id}_${step}_param_${param.key}`"
                :placeholder="param.type" v-model="answers[index][0]" required>
            </label>
          </template>
        </div>
      </template>
      <template v-else-if="currentQuestCfg">
        <small>Question {{ currentQuestIdx + 1 }} of {{ stepCfg.quiz.length }}</small>
        <h4 class="w-full text-center mb-4">{{ currentQuestCfg.question }}</h4>
        <div class="w-full px-4 py-2 flex flex-col gap-2">
          <img v-if="currentQuestCfg.image" class="object-contain justify-items-center max-h-32"
            :src="getIPFSUrl(currentQuestCfg.image)" alt="question alt" />
          <template v-for="option in currentQuestOptions" :key="`quiz_${currentQuestIdx}_${option.i}`">
            <label :for="`${quest.id}_${step}_quiz_${currentQuestIdx}_${option.i}`"
              :class="['card card-border border-2 p-4',{ '!border-success bg-success/10': isSelectedQuizAnswer(option.i) && isTheQuizAnswerCorrect(option.i), '!border-failure bg-failure/10': isSelectedQuizAnswer(option.i) && !isTheQuizAnswerCorrect(option.i)}]">
              <input v-if="currentQuestCfg.type === 'radio'" type="radio"
                :id="`${quest.id}_${step}_quiz_${currentQuestIdx}_${option.i}`"
                :value="option.key" v-model="answers[currentQuestIdx][0]"
                :aria-invalid="isSelectedQuizAnswer(option.i) ? !isTheQuizAnswerCorrect(option.i) : undefined"
                :disabled="submitLoading" />
              <input v-else type="checkbox"
                :id="`${quest.id}_${step}_quiz_${currentQuestIdx}_${option.i}`" :value="option.key" v-model="answers[currentQuestIdx]"
                :aria-invalid="isSelectedQuizAnswer(option.i) ? !isTheQuizAnswerCorrect(option.i) : undefined"
                :disabled="submitLoading" />
              {{ option.description }}
            </label>
          </template>
        </div>
      </template>
    </div>
    <footer class="mt-4">
      <button v-if="stepCfg.type === 'quiz' && !isLastQuizQuestion" class="rounded-xl flex-center mb-0"
        :disabled="!isAnswerTotallyCorrect" @click.stop.prevent="() => currentQuestIdx++">
        {{ isAnswerTotallyCorrect ? 'Next Question' : 'Incorrect 🙅‍♀️' }}
      </button>
      <FlowSubmitTransaction v-else-if="stepCfg.type === 'onchain' || isLastQuizQuestion"
        :disabled="!isAnswerCompleted || (stepCfg.type === 'quiz' && !isAnswerTotallyCorrect)" :method="onSubmitAnswer"
        @sealed="resetComp()"
        @error="resetComp()"
        @success="emit('success')"
        @reset="onCloseDialgue()"
      >
        Submit
        <template v-slot:disabled>
          {{ stepCfg.type === 'onchain' ? 'Missing Parameters' : 'Incorrect 🙅‍♀️' }}
        </template>
      </FlowSubmitTransaction>
    </footer>
  </WidgetDialog>
</template>
