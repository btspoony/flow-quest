// ---- General ----

interface Display {
  name: string;
  description: string;
  thumbnail?: string;
}

// ---- Service Data ----

type UnlockConditionTypes =
  | "CompletedAmount"
  | "MinimumLevel"
  | "TimeLimited"
  | "AchievementRequired";

interface UnlockCondition {
  type: UnlockConditionTypes;
  display: Display;
}

interface CompletedAmountUnlockCondition extends UnlockCondition {
  limit: number;
}

interface MinimumLevelUnlockCondition extends UnlockCondition {
  level: number;
  points: number;
}

interface TimeLimitedUnlockCondition extends UnlockCondition {
  endDate: number;
}

interface AchievementRequiredCondition extends UnlockCondition {
  achievementId: number;
  achievementUrl: string;
}

type UnlockConditions =
  | CompletedAmountUnlockCondition
  | MinimumLevelUnlockCondition
  | TimeLimitedUnlockCondition
  | AchievementRequiredCondition;

type QuestType = "Points" | "NFT";

interface RewardInfo {
  rewardType: QuestType;
}

interface PointRewardInfo extends RewardInfo {
  rewardPoints: number;
  referalPoints: number;
}

interface NFTRewardInfo extends RewardInfo {
  floatEventId: string;
}

type BountyType = "quest" | "challenge";
type RewardInfos = PointRewardInfo | NFTRewardInfo;

interface BountyEntity {
  key: string;
  category: BountyType;
  communityId: string;
  preconditions: UnlockConditions[];
  rewardInfo: RewardInfos;
}

interface QuestConfig extends BountyEntity {
  stackable?: boolean;
  limitation?: number;
}

interface ChallengeConfig extends BountyEntity {
  quests: QuestConfig[];
  deliverAchievementId: string;
}

interface ParticipantRecord {
  address: string;
  datetime: number;
}

interface QuestStatus {
  questKey: string;
  participants: ParticipantRecord[];
}

interface Community {
  owner: string;
  communityId: string;
  display: Display;
  banner: string;
  socials: {
    twitter: string;
    discord: string;
    website: string;
  };
}

// ---- Profile ----

interface ProfileData {
  id: string;
}

interface Profile {
  loggedIn: boolean;
  profile?: ProfileData;
}

interface GithubToken {
  tokenType: string;
  scope: string;
  accessToken: string;
}

interface GithubProfileData {
  id: number;
  userName: string;
  displayName: string;
  avatarUrl: string;
  email: string;
  bio: string;
  location: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: Date;
  updated_at: Date;
}

interface GithubProfile {
  auth?: GithubToken;
  data?: GithubProfileData;
}
