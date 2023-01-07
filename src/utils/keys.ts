import type { InjectionKey, Ref } from "vue";

interface SpaceInjectType {
  space: Ref<CommunitySpaceBasics | null>;
  refresh?: (opts?: any) => Promise<void>;
}

export const spaceInjectKey: InjectionKey<SpaceInjectType> =
  Symbol("app.space");
