<script setup lang="ts">
const questAddr = ref<string | null>(null)

async function onclick() {
  const { $fcl } = useNuxtApp();
  const user = await $fcl.currentUser.snapshot()
  const accountProof = user.services?.find(one => one.type === "account-proof")
  if (!accountProof) {
    console.log("accountProof not found")
    return
  }
  try {
    const data = await $fetch("/api/verify-quest", {
      method: 'post',
      body: {
        address: user.addr,
        proofNonce: accountProof.data.nonce,
        proofSigs: accountProof.data.signatures,
        questKey: "S1Q1",
        questAddr: questAddr.value,
      },
    })
    console.log(data)
  } catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <main>
    <section>
      <label for="quest">Verification Test</label>
      <input type="text" id="quest" name="quest" placeholder="Flow Address" v-model="questAddr" required>

      <button type="submit" @click="onclick()">Submit</button>
    </section>
  </main>
</template>
