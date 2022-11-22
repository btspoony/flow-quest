import type { UserSnapshot } from "@onflow/fcl";

// ---- Flow status -----

export const useFlowAccount = () =>
  useState<UserSnapshot | null>("currentFlowAccount", () => ref(null));
