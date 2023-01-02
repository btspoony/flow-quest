export const useReferralCode = () =>
  useState<string | null>("appReferralCode", () => ref(null));

export const useCurrentChallenge = () =>
  useState<BountyInfo | null>("currentChallenge", () => ref(null));

export const useCurrentQuest = () =>
  useState<BountyInfo | null>("currentQuest", () => ref(null));

export const useActiveSeason = () =>
  useState<CompetitionSeason | null>("activeSeason", () => ref(null));

export const useCommunitySpaceBasics = (communityId: string) =>
  useState<CommunitySpaceBasics | null>(`community:${communityId}`, () =>
    ref(null)
  );

export const useCurrentProfile = () =>
  useState<ProfileData | null>("currentProfile", () => ref(null));
