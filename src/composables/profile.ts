import type { UserSnapshot } from "@onflow/fcl";

export const useUserProfile = () =>
  useState<Profile>("currentProfile", () =>
    ref({
      loggedIn: false,
    })
  );

export const useFlowAccount = () =>
  useState<UserSnapshot | null>("currentFlowAccount", () => ref(null));
