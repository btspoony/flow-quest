<script setup lang="ts">
const props = defineProps<{
  index: number
}>()

const injected = inject(spaceNewQuestsInjectKey, [])

const cfgPreview = ref("")
const isStepsCfgURLValid = ref(false)
const stepsCfgLoading = ref(false)

const mdPreview = ref("")
const isGuideMDURLValid = ref(false)
const guildMDLoading = ref(false)

watch([isStepsCfgURLValid, isGuideMDURLValid], ([newStepsValidA, newGuideValidB]) => {
  const data = injected[props.index]
  if (
    data.key
    && data.key !== 'create-quest'
    && data.key !== 'create-challenge'
    && data.name
    && data.description
    && newStepsValidA
    && newGuideValidB
  ) {
    injected[props.index].valid = true
  } else {
    injected[props.index].valid = false
  }
})

async function loadAndValidateCfg() {
  let valid = false
  try {
    stepsCfgLoading.value = true
    const cfgJson = await $fetch(injected[props.index].stepsCfg)
    stepsCfgLoading.value = false
    const cfg = JSON.parse(cfgJson as string)
    if (Array.isArray(cfg)) {
      valid = cfg.filter(one => {
        const stepCfg = one as QuestStepsConfig
        return typeof stepCfg.type === 'string'
          && typeof stepCfg.title === 'string'
          && (stepCfg.type === 'onchain' ? typeof stepCfg.code === 'string' && Array.isArray(stepCfg.schema) : Array.isArray(stepCfg.quiz))
      }).length === cfg.length

      if (valid) {
        injected[props.index].steps = cfg.length
        cfgPreview.value = JSON.stringify(cfg, null, '\t')
      } else {
        cfgPreview.value = "Invalid JSON."
      }
    }
  } catch (e) {
    cfgPreview.value = "Unknown"
  }
  isStepsCfgURLValid.value = valid
}

async function loadAndValidateGuideMD() {
  let valid = false
  const mdURL = injected[props.index].guideMD
  if (mdURL.endsWith('.md')) {
    try {
      guildMDLoading.value = true
      const md = await $fetch(mdURL)
      guildMDLoading.value = false
      if (typeof md === 'string') {
        valid = true
        mdPreview.value = md
      }
    } catch (e) { }
  }
  if (!valid) {
    mdPreview.value = ""
  }
  isGuideMDURLValid.value = valid
}

</script>

<template>
  <form class="mb-0">
    <label for="questKey">
      Key
      <input type="text" id="questKey" placeholder="Unique Key" v-model.trim="injected[index].key" required />
    </label>
    <label for="questTitle">
      Title
      <input type="text" id="questTitle" placeholder="Title" v-model.trim="injected[index].name" required />
    </label>
    <label for="questDesc">
      Description
      <input type="text" id="questDesc" placeholder="Description" v-model.trim="injected[index].description" required />
    </label>
    <div class="grid mb-2">
      <label for="questStepsCfg">
        URL of quest steps config
        <input type="url" id="questStepsCfg" placeholder="https://raw.githubusercontent.com/.../verify.json"
          v-model.trim="injected[index].stepsCfg"
          :aria-invalid="!injected[index].stepsCfg ? undefined : !isStepsCfgURLValid"
          :aria-busy="stepsCfgLoading"
          @change="loadAndValidateCfg"
          required />
      </label>
      <code class="overflow-scroll max-h-28" :aria-busy="stepsCfgLoading">{{ cfgPreview }}</code>
    </div>
    <div class="grid">
      <label for="questGuideMD">
        URL of guild markdown
        <input type="url" id="questGuideMD" placeholder="https://raw.githubusercontent.com/.../README.md"
          v-model.trim="injected[index].guideMD"
          :aria-invalid="!injected[index].guideMD ? undefined : !isGuideMDURLValid"
          :aria-busy="guildMDLoading"
          @change="loadAndValidateGuideMD"
          required />
      </label>
      <code class="overflow-scroll max-h-28" :aria-busy="guildMDLoading">{{ mdPreview }}</code>
      </div>
  </form>
</template>
