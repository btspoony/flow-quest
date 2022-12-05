export const useCurrentBounty = () =>
  useState<BountyInfo | null>("currentBounty", () => ref(null));
