import type { InjectionKey, Ref, UnwrapNestedRefs } from "vue";

interface SpaceInjectType {
  space: Ref<CommunitySpaceBasics | null>;
  refresh?: (opts?: any) => Promise<void>;
}

export const spaceInjectKey: InjectionKey<SpaceInjectType> =
  Symbol("app.space");

export const spaceNewQuestsInjectKey: InjectionKey<
  UnwrapNestedRefs<QuestConfigRequest>[]
> = Symbol("app.new-quests");
