export const useReferralCode = () =>
  useState<string | null>("appReferralCode", () => ref(null));

export const useCurrentChallenge = () =>
  useState<BountyInfo | null>("currentChallenge", () => ref(null));

export const useCurrentQuest = () =>
  useState<BountyInfo | null>("currentQuest", () => ref(null));

export const useActiveSeason = () =>
  useState<CompetitionSeason | null>("activeSeason", () => ref(null));

export const useCommunityBasics = (communityId: string) =>
  useState<CommunityBasics | null>(`community:${communityId}`, () => ref(null));
