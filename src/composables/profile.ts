import type { UserSnapshot } from "@onflow/fcl";

export const useUserProfile = () =>
  useState<ProfileData | null>("currentUserProfile", () => ref(null));

export const useUserProfileInitializing = () =>
  useState<boolean>("isCurrentUserProfileInit", () => ref(false));

export const useUserProfileLoading = () =>
  useState<boolean>("isCurrentUserProfileLoading", () => ref(false));

export const useLinkedWalletAddress = () =>
  useState<string | null>("currentLinkedWalletAddress", () => ref(null));

export const useGithubProfile = () =>
  useState<GithubProfile>("currentGithubProfile", () =>
    ref({
      auth: undefined,
      data: undefined,
    })
  );

export const useFlowAccount = () =>
  useState<UserSnapshot | null>("currentFlowAccount", () => ref(null));

export const useNetworkCorrect = () =>
  useState<boolean>("currentFlowNetworkCorrect", () => ref(false));
