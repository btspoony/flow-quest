export const useCurrentChallenge = () =>
  useState<BountyInfo | null>("currentChallenge", () => ref(null));

export const useCurrentQuest = () =>
  useState<BountyInfo | null>("currentQuest", () => ref(null));
