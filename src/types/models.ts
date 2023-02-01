// ---- General ----

interface EnumData {
  rawValue: string;
}

interface Display {
  name: string;
  description: string;
  thumbnail?: string;
}

// ---- Service Data ----

interface ListReqOption {
  page: number;
  limit: number;
}

enum UnlockConditionTypes {
  MinimumPoint = 0,
  FLOATRequired,
  CompletedBountyAmount,
  BountyCompleted,
}

interface UnlockCondition {
  type: UnlockConditionTypes;
}

interface MinimumPointRequired extends UnlockCondition {
  type: UnlockConditionTypes.MinimumPoint;
  amount: number;
  seasonId?: string;
  usePermanentPoint?: boolean;
}

interface FLOATRequired extends UnlockCondition {
  type: UnlockConditionTypes.FLOATRequired;
  host: string;
  eventId: string;
}

interface BountyCompleted extends UnlockCondition {
  type: UnlockConditionTypes.BountyCompleted;
  bountyId: string;
}

type UnlockConditions = MinimumPointRequired | FLOATRequired | BountyCompleted;

type MissionRewardType = "Points" | "FLOAT" | "None";

interface RewardInfo {
  rewardType: MissionRewardType;
}

interface PointRewardInfo extends RewardInfo {
  rewardPoints: number;
  referalPoints: number;
}

interface FLOATRewardInfo extends RewardInfo {
  eventHost: string;
  eventId: string;
}

type BountyType = "mission" | "quest";
type RewardInfos = PointRewardInfo | FLOATRewardInfo;

/**
 * Bounty basis data
 */
interface BountyEntity extends BountyIdentifier {
  category: BountyType;
  key: string;
  communityId: string;
  display: Display;
}

interface MissionDetail {
  steps: number;
  stepsCfg: string;
  guideMD?: string;
}

interface MissionConfig extends BountyEntity, MissionDetail {}

interface MissionConfigRequest extends Display, MissionDetail {
  key: string;
  valid?: boolean;
}

interface QuizOptionConfig {
  key: string;
  description: string;
}

interface QuizSchema {
  type: "radio" | "checkbox";
  question: string;
  image?: string;
  options: QuizOptionConfig[];
  answer: string;
}

interface MissionStepBasic {
  title: string;
  description: string;
  external?: string;
}

interface MissionStepQuiz extends MissionStepBasic {
  type: "quiz";
  quiz: QuizSchema[];
}

interface MissionStepTest {
  network: "testnet" | "mainnet";
  expect: "return" | "error";
  result: any;
}

interface MissionSchema {
  key: string;
  type: string;
  label?: string;
}

interface MissionStepOnChain extends MissionStepBasic {
  type: "onchain";
  code: string;
  schema: MissionSchema[];
  test: MissionStepTest; // All tests should be OK, then mission passed
}

type MissionStepsConfig = MissionStepQuiz | MissionStepOnChain;

interface MissionDetailConfig {
  guide?: string;
  steps: MissionStepsConfig[];
}

interface FLOATAchievement {
  host: string;
  eventId: string;
}

interface QuestDetail {
  missions: BountyIdentifier[];
  achievement?: FLOATAchievement;
}

interface QuestConfig extends BountyEntity, QuestDetail {}

interface QuestConfigDetail {
  owner: string;
  quest: QuestConfig;
  missions: MissionConfig[];
}

interface FLOATBasics {
  name: string;
  description: string;
  image: string;
  url: string;
}

interface FLOATEvent extends FLOATBasics {
  claimable: boolean;
  eventId: string;
  host: string;
  totalSupply: number;
}

type BountyEntities = MissionConfig | QuestConfig;

interface SpaceDisplay {
  name: string;
  description: string;
  imageUrl?: string;
  bannerUrl?: string;
  socials: {
    twitter?: string;
    discord?: string;
    website?: string;
  };
}

interface CommunitySpaceBasics {
  owner: string;
  id: string;
  key: string;
  display: SpaceDisplay;
}

/**
 * Season related data
 */
interface BountyIdentifier {
  category: BountyType;
  communityId: string;
  key: string;
}

interface ParticipantRecord {
  datetime: number;
  [key: string]: any;
}

interface BountyProperties {
  Launched: boolean;
  Featured: boolean;
}

interface BountyInfo {
  id: string;
  config: BountyEntities; // load dynamic by identifier
  properties: BountyProperties;
  preconditions: UnlockConditions[];
  participants: { [key: string]: ParticipantRecord };
  participantAmt: number;
  rewardType: MissionRewardType;
  pointReward?: PointRewardInfo;
  floatReward?: FLOATRewardInfo;
}

interface CompetitionSeason {
  seasonId?: string;
  endDate?: number;
  referralThreshold?: number;
  bounties: { [uid: string]: BountyInfo };
}

// ---- Profile ----

interface AdminStatus {
  valid: boolean;
  enabled: boolean;
}

interface MissionStatus {
  steps: boolean[];
  completed: boolean;
}

interface SeasonRecord {
  referredFromAddress?: string;
  referralCode?: string;
  points: number;
  seasonPoints: { [seasonId: string]: number };
  missionScores: { [key: string]: MissionStatus };
  bountiesCompleted: { [uid: string]: string };
}

interface ProfileData {
  address: string;
  linkedIdentities: { [key: string]: ProfileIdentity };
  activeRecord?: SeasonRecord;
  adminStatus?: AdminStatus;
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

interface ProfileIdentity {
  platform: string;
  uid: string;
  display: Display;
}

interface AccountProfileIdentity {
  account: string;
  identity: ProfileIdentity;
}

// ---- Ranking ----

interface RankingStatus {
  account?: RankingScore
  tops: RankingScore[]
}

interface RankingScore {
  account: string;
  rank: number;
  score: number;
  identity?: ProfileIdentity;
}
