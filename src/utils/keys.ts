import type { InjectionKey, Ref, UnwrapNestedRefs } from "vue";

interface SpaceInjectType {
  space: Ref<CommunitySpaceBasics | null>;
  refresh?: (opts?: any) => Promise<void>;
}

export const spaceInjectKey: InjectionKey<SpaceInjectType> =
  Symbol("app.space");

interface NewQuestsInjectType {
  [key: number]: UnwrapNestedRefs<QuestConfigRequest>;
}

export const spaceNewQuestsInjectKey: InjectionKey<NewQuestsInjectType> =
  Symbol("app.new-quests");
