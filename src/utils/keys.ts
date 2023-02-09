import type { InjectionKey, ComputedRef, Ref, UnwrapNestedRefs } from "vue";

interface SpaceInjectType {
  space: Ref<CommunitySpaceBasics | null>;
  refresh?: (opts?: any) => Promise<void>;
}

export const spaceInjectKey: InjectionKey<SpaceInjectType> =
  Symbol("app.space");

export const spaceNewMissionsInjectKey: InjectionKey<
  UnwrapNestedRefs<MissionConfigRequest>[]
> = Symbol("app.new-missions");

interface MissionStepGitHubVerification {
  repos: ComputedRef<string[]>;
  updateValidRepos: (repos: string[]) => void;
}

export const missionGithubVerifyInjectKey: InjectionKey<MissionStepGitHubVerification> =
  Symbol("mission.step-github-items");
