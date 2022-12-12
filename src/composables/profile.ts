import type { UserSnapshot } from "@onflow/fcl";

export const useUserProfile = () =>
  useState<ProfileData | null>("currentProfile", () => ref(null));

export const useGithubProfile = () =>
  useState<GithubProfile>("currentGithubProfile", () =>
    ref({
      auth: undefined,
      data: undefined,
    })
  );

export const useFlowAccount = () =>
  useState<UserSnapshot | null>("currentFlowAccount", () => ref(null));
