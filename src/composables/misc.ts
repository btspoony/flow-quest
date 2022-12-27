export const useSharedDark = () =>
  useState<boolean>("sharedDark", () => ref(false));

export const useAppDrawerOpened = () =>
  useState<boolean>("appDrawerOpened", () => ref(false));
