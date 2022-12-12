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
  let user: ProfileData;
  if (current.value) {
    user = current.value;
  } else {
    const wallet = useFlowAccount();
    if (!wallet.value?.loggedIn) {
      return null;
    }
    const address = wallet.value.addr!;
    const { $scripts } = useNuxtApp();
    user = await $scripts.loadUserProfile(address);
  }
  return user;
}
