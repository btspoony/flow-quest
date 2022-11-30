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

interface TimeLimitedUnlockCondition extends UnlockCondition {
  endDate: number;
}

type UnlockConditions =
  | TimeLimitedUnlockCondition
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
  display: Display;
  // all seasons
  seasonsIncluded: string[];
}

interface QuestConfig extends BountyEntity {
  steps: number;
  stackable?: boolean;
  limitation?: number;
}

interface ChallengeConfig extends BountyEntity {
  quests: BountyIdentifier[];
  accomplishAchievementId?: string;
}

type BountyEntities = QuestConfig | ChallengeConfig;

interface ParticipantRecord {
  address: string;
  datetime: number;
}

interface CommuntiyBountyBasics {
  category: BountyType;
  key: string;
  createdAt: number;
  active: boolean;
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
  quests: { [key: string]: QuestConfig };
  challenges: { [key: string]: ChallengeConfig };
  bounties: CommuntiyBountyBasics[];
}

/**
 * Season related data
 */
interface BountyIdentifier {
  communityId: string;
  key: string;
  category: BountyType;
}

interface BountyInfo {
  identifier: BountyIdentifier;
  config?: BountyEntities; // load dynamic
  preconditions: UnlockConditions[];
  rewardInfo: RewardInfos;
  participants: ParticipantRecord[];
}

interface CompetitionSeason {
  endDate: number;
  bounties: { [uid: string]: BountyInfo };
}

// ---- Profile ----

interface VerificationStep {
  params: { [key: string]: string }[];
  results: { [times: number]: boolean };
}

interface QuestRecord {
  timesCompleted: number;
  steps: VerificationStep[];
}

interface SeasonRecord {
  seasonId: string;
  referredFromCode: string;
  referredFromAddress: string;
  referralCode: string;
  points: number;
  questScores: { [key: string]: QuestRecord };
  bountiesCompleted: { [uid: string]: number };
}

interface ProfileData {
  id: string;
  seasonRecords: { [key: string]: SeasonRecord };
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
