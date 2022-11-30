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

interface AchievementRequiredCondition extends UnlockCondition {
  achievementId: number;
  achievementUrl: string;
}

interface ChallengeIndexCondition extends UnlockCondition {
  challengeKey: string;
  index: number;
}

type UnlockConditions =
  | CompletedAmountUnlockCondition
  | MinimumLevelUnlockCondition
  | AchievementRequiredCondition
  | ChallengeIndexCondition;

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

/**
 * Bounty basis data
 */
interface BountyEntity {
  category: BountyType;
  key: string;
  communityId: string;
  preconditions: UnlockConditions[];
  display: Display;
  // all seasons
  seasonsIncluded: string[];
}

interface QuestConfig extends BountyEntity {
  stackable?: boolean;
  limitation?: number;
}

interface ChallengeConfig extends BountyEntity {
  quests: QuestConfig[];
  accomplishAchievementId?: string;
}

type BountyEntities = QuestConfig | ChallengeConfig;

interface ParticipantRecord {
  address: string;
  datetime: number;
}

interface Community {
  owner: string;
  communityId: string;
  display: Display;
  banner?: string;
  socials: {
    twitter?: string;
    discord?: string;
    website?: string;
  };
  bounties: { [key: string]: BountyEntities };
}

/**
 * Season related data
 */
interface BountyIdentifier {
  communityId: string;
  bountyKey: string;
  category: BountyType;
}

interface BountyStatus {
  bountyIdentifier: BountyIdentifier;
  bountyConfig?: BountyEntities; // load dynamic
  endDate: number;
  rewardInfo: RewardInfos;
  participants: ParticipantRecord[];
}

interface CompetitionSeason {
  endDate: number;
  bounties: {[key: string]: BountyStatus};
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
