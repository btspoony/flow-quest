import type { UserSnapshot } from "@onflow/fcl";

export const useUserProfile = () =>
  useState<Profile>("currentProfile", () =>
    ref({
      loggedIn: false,
      profile: undefined,
    })
  );

export const useGithubProfile = () =>
  useState<GithubProfile>("currentGithubProfile", () =>
    ref({
      auth: undefined,
      data: undefined,
    })
  );

export const useFlowAccount = () =>
  useState<UserSnapshot | null>("currentFlowAccount", () => ref(null));
