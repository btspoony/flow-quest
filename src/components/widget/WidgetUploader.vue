<script setup lang="ts">
import { NFTStorage } from "nft.storage";

withDefaults(defineProps<{
  required?: boolean
}>(), {
  required: true
})

const cfg = useRuntimeConfig()

const client = new NFTStorage({ token: cfg.public.nftStorageToken });

const emit = defineEmits<{
  (e: 'ipfsAdded', cid: string): void
}>()

// ipfs uploading related
const uploading = ref(false);
const uploadedSuccessfully = ref(false);
const imagePreviewSrc = ref<string | null>(null);

async function uploadToIPFS(e: Event) {
  uploading.value = true
  uploadedSuccessfully.value = false

  const target = e.target as HTMLInputElement
  const cid = await client.storeBlob(target.files![0]);

  uploadedSuccessfully.value = true
  uploading.value = false

  imagePreviewSrc.value = cid
  emit('ipfsAdded', cid);
}
</script>

<template>
  <div class="grid">
    <label v-if="!imagePreviewSrc" for="image">
      <slot>Image</slot>
      <input :aria-busy="!!uploading" type="file" id="image" accept="image/png, image/gif, image/jpeg"
        :disabled="uploading" @change="uploadToIPFS" :required="required"/>
      <progress v-if="uploading" indeterminate />
    </label>
    <div v-if="imagePreviewSrc">
      <h5 class="mb-1">Preview</h5>
      <slot name="preview">
        <p>No Preview</p>
      </slot>
    </div>
  </div>
  <small v-if="uploadedSuccessfully">✓ Image uploaded successfully to IPFS!</small>
</template>
