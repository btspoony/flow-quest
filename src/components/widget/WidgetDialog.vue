<script setup lang="ts">
const props = withDefaults(defineProps<{
  locked?: boolean
}>(), {
  locked: false
})
const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "closed"): void
}>()

const open = ref(false)
const dialog = ref<HTMLDialogElement | null>(null)

const isModalOpen = computed(() => dialog.value?.hasAttribute('open') && dialog.value.getAttribute('open') !== 'false' ? true : false)

function openModal() {
  if (!open.value) {
    setTimeout(() => {
      dialog.value?.setAttribute('open', "true")
      open.value = true
      emit('update:open', true)
    }, 100)
  }
}

function closeModal() {
  if (props.locked) return

  if (open.value) {
    open.value = false
    dialog.value?.setAttribute('open', "false")
    emit('update:open', false)
    emit('closed')
  }
}

defineExpose({
  openModal: ref(openModal),
  closeModal: ref(closeModal),
})

function clickCloseModal(event: MouseEvent) {
  if (dialog.value && open.value && event.target) {
    const modalContent = dialog.value.querySelector('article');
    const isClickInside = modalContent?.contains(event.target as Node);
    !isClickInside && closeModal();
  }
}

function keyDownESC(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeModal();
  }
}

onMounted(() => {
  // Close with a click outside
  document.addEventListener('click', clickCloseModal);
  // Close with Esc key
  document.addEventListener('keydown', keyDownESC);
})

onUnmounted(() => {
  // Close with a click outside
  document.removeEventListener('click', clickCloseModal);
  // Close with Esc key
  document.removeEventListener('keydown', keyDownESC);
})

</script>

<template>
  <dialog ref="dialog">
    <article class="min-w-[640px]">
      <slot />
    </article>
  </dialog>
</template>
