export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client && typeof to.query.referral === "string") {
    const store = useReferralCode();
    if (store.value !== to.query.referral) {
      store.value = to.query.referral;
    }
  }
});
