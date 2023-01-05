export const useReferralCode = () =>
  useState<string | null>("appReferralCode", () => ref(null));

export const useCurrentChallenge = () =>
  useState<BountyInfo | null>("currentChallenge", () => ref(null));

export const useCurrentQuest = () =>
  useState<BountyInfo | null>("currentQuest", () => ref(null));

export const useActiveSeason = () =>
  useState<CompetitionSeason | null>("activeSeason", () => ref(null));

export const useCurrentAccountProfile = () =>
  useState<ProfileData | null>("currentAccountProfile", () => ref(null));

export const useCommunitySpaceBasics = (communityId: string) =>
  useState<CommunitySpaceBasics | null>(`community:${communityId}`, () =>
    ref(null)
  );

export const useCurrentSpace = () =>
  useState<CommunitySpaceBasics | null>(`currentSpace`, () => ref(null));

export const useSpacesUpdated = () =>
  useState<boolean>(`spacesUpdated`, () => ref(false));
