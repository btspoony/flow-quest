export const useCurrentChallenge = () =>
  useState<BountyInfo | null>("currentChallenge", () => ref(null));

export const useCurrentQuest = () =>
  useState<BountyInfo | null>("currentQuest", () => ref(null));

export const useActiveSeason = () =>
  useState<CompetitionSeason | null>("activeSeason", () => ref(null));
