<script setup lang="ts">
definePageMeta({
  middleware: (to, from) => {
    const wallet = useFlowAccount()
    if (wallet.value?.loggedIn) {
      return navigateTo(`/account/${wallet.value.addr}`)
    } else {
      return navigateTo('/')
    }
  }
})
</script>
