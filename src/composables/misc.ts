export const useSharedDark = () =>
  useState<boolean>("sharedDark", () => ref(false));
