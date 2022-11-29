<script setup lang="ts">
definePageMeta({
  middleware: (to, from) => {
    return navigateTo('/account/profile')
  }
})
</script>
