<script setup lang="ts">
definePageMeta({
  key: route => route.path
})

const router = useRouter()
const spacesUpdated = useSpacesUpdated()

interface SpaceData {
  key: string;
  name: string;
  description: string;
  image: string;
  banner?: string;
  twitter?: string;
  discord?: string;
  website?: string;
};

const data = reactive<SpaceData>({
  key: '',
  name: '',
  description: '',
  image: '',
  banner: undefined,
  twitter: undefined,
  discord: undefined,
  website: undefined,
})

function resetComp() {
  data.key = ''
  data.name = ''
  data.description = ''
  data.image = ''
  data.banner = undefined
  data.twitter = undefined
  data.discord = undefined
  data.website = undefined
}

const isAllRequired = computed(() => data.key && data.key !== 'create' && data.name && data.description && data.image)

function onTransactionSuccess() {
  spacesUpdated.value = true
  router.push(geneReferralLinkObject(`/spaces/${data.key}`))
}

async function sendCreateCommunity(): Promise<string> {
  const { $transactions } = useNuxtApp();
  return $transactions.spaceCreate(
    data.key,
    data.name,
    data.description,
    data.image,
    data.banner,
    data.twitter,
    data.discord,
    data.website
  )
}
</script>

<template>
  <div class="pt-8">
    <h2>Create a new community space</h2>
    <form>
      <div class="grid">
        <label for="spaceKey">
          Key
          <input type="text" id="spaceKey" placeholder="Unique Key" v-model="data.key" required />
        </label>
        <label for="spaceName">
          Name
          <input type="text" id="spaceName" placeholder="Display Name" v-model="data.name" required />
        </label>
      </div>
      <label for="spaceDesc">
        Description
        <textarea id="spaceDesc" placeholder="Description" class="resize-y h-28 max-h-60" v-model.trim="data.description"
          required />
      </label>
      <WidgetUploader @ipfs-added="(cid) => { data.image = cid }">
        <template v-slot:preview>
          <img v-if="data.image" :src="getIPFSUrl(data.image)" class="max-w-[12rem] max-h-[12rem]" alt="Image Preview" />
        </template>
      </WidgetUploader>
      <div class="grid">
        <label for="socialTwitter">
          Twitter
          <input type="text" id="socialTwitter" placeholder="Twitter" v-model="data.twitter" />
        </label>
        <label for="socialDiscord">
          Discord
          <input type="text" id="socialDiscord" placeholder="Discord" v-model="data.discord" />
        </label>
        <label for="socialWebsite">
          Website
          <input type="text" id="socialWebsite" placeholder="Website" v-model="data.website" />
        </label>
      </div>
      <FlowSubmitTransaction :disabled="!isAllRequired" :method="sendCreateCommunity"
        @success="onTransactionSuccess()" @sealed="resetComp()" @reset="resetComp()">
        <template v-slot:disabled>
          <span>Required parameters should be filled</span>
        </template>
      </FlowSubmitTransaction>
    </form>
  </div>
</template>
