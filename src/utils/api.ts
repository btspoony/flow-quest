export async function apiGetActiveSeason(): Promise<CompetitionSeason> {
  const activeSeason = useActiveSeason();
  if (activeSeason.value) {
    return activeSeason.value;
  } else {
    const { $scripts } = useNuxtApp();
    const result = await $scripts.getActiveSeason();
    activeSeason.value = result;
    return result;
  }
}

export async function apiGetCurrentChallenge(
  defaultBountyId: string
): Promise<BountyInfo> {
  const season = await apiGetActiveSeason();

  const current = useCurrentChallenge();
  let challenge: BountyInfo;
  if (current.value) {
    challenge = current.value;
  } else {
    const { $scripts } = useNuxtApp();
    challenge = await $scripts.getBountyById(season.seasonId, defaultBountyId);
  }
  return challenge;
}

export async function apiGetCurrentQuest(
  defaultQuestKey: string
): Promise<BountyInfo> {
  const season = await apiGetActiveSeason();

  const current = useCurrentQuest();
  let quest: BountyInfo;
  if (current.value) {
    quest = current.value;
  } else {
    const { $scripts } = useNuxtApp();
    quest = await $scripts.getBountyByKey(season.seasonId, defaultQuestKey);
  }
  return quest;
}

export async function apiGetCurrentUser(): Promise<ProfileData | null> {
  const current = useUserProfile();
  let user: ProfileData | null;
  if (current.value) {
    user = current.value;
  } else {
    user = await reloadCurrentUser();
  }
  return user;
}

export async function reloadCurrentUser(): Promise<ProfileData | null> {
  const current = useUserProfile();
  const wallet = useFlowAccount();
  if (!wallet.value?.loggedIn) {
    return null;
  }
  const address = wallet.value.addr!;
  const { $scripts } = useNuxtApp();
  current.value = await $scripts.loadUserProfile(address);
  return current.value;
}

export async function fetchAccountProof() {
  const { $fcl } = useNuxtApp();
  const user = await $fcl.currentUser.snapshot();
  const accountProof = user.services?.find(
    (one) => one.type === "account-proof"
  );
  if (!accountProof) {
    console.log("accountProof not found");
    throw new Error("accountProof not found");
  }
  return {
    address: user.addr,
    proofNonce: accountProof.data.nonce,
    proofSigs: accountProof.data.signatures,
  };
}

export async function apiPostVerifyQuest(
  questIdentifier: BountyIdentifier,
  step: number,
  questParams: { key: string; value: string }[]
): Promise<ResponseVerifyQuest | undefined> {
  try {
    const result = await $fetch("/api/verify-quest", {
      method: "post",
      body: Object.assign(
        {
          communityId: questIdentifier.communityId,
          questKey: questIdentifier.key,
          step,
          questParams,
        },
        await fetchAccountProof()
      ),
    });
    return result;
  } catch (e) {
    console.error(e);
  }
}

export async function apiPostCompleteBounty(
  bountyId: string
): Promise<ResponseCompleteBounty | undefined> {
  try {
    const result = await $fetch("/api/complete-bounty", {
      method: "post",
      body: Object.assign(
        {
          bountyId: bountyId,
        },
        await fetchAccountProof()
      ),
    });
    return result;
  } catch (e) {
    console.error(e);
  }
}
