import MetadataViews from "../deps/MetadataViews.cdc"
import Helper from "./Helper.cdc"

pub contract Interfaces {

    // =================== Profile ====================

    pub struct LinkedIdentity {
        pub let platform: String
        pub let uid: String
        pub let display: MetadataViews.Display

        init(platform: String, uid: String, display: MetadataViews.Display) {
            self.platform = platform
            self.uid = uid
            self.display = display
        }
    }

    pub struct QuestStatus {
        pub let steps: [Bool]
        pub let completed: Bool

        init(
            steps: [Bool]
        ) {
            self.steps = steps
            var completed = true
            for one in steps {
                completed = one && completed
            }
            self.completed = completed
        }
    }

    // Profile readable
    pub resource interface ProfilePublic {
        pub fun getId(): UInt64

        pub fun getIdentities(): [LinkedIdentity]
        pub fun getIdentity(platform: String): LinkedIdentity

        pub fun getSeasonPoints(seasonId: UInt64): UInt64
        pub fun getReferredFrom(seasonId: UInt64): Address?
        pub fun getReferralCode(seasonId: UInt64): String?

        // readable
        pub fun isRegistered(seasonId: UInt64): Bool
        pub fun getBountiesCompleted(seasonId: UInt64): {UInt64: UFix64}
        pub fun isBountyCompleted(seasonId: UInt64, bountyId: UInt64): Bool
        pub fun getQuestStatus(seasonId: UInt64, questKey: String): QuestStatus
        pub fun getQuestsParticipanted(seasonId: UInt64): [String]

        // writable
        access(account) fun addPoints(seasonId: UInt64, points: UInt64)
        access(account) fun updateQuestNewParams(seasonId: UInt64, questKey: String, step: Int, params: {String: AnyStruct})
        access(account) fun updateQuestVerificationResult(seasonId: UInt64, questKey: String, step: Int, result: Bool)
        access(account) fun completeBounty(seasonId: UInt64, bountyId: UInt64)

        access(account) fun setupReferralCode(seasonId: UInt64, code: String)
    }

    // =================== Community ====================

    pub enum BountyType: UInt8 {
        pub case quest
        pub case challenge
    }

    pub struct interface BountyEntityIdentifier {
        pub let category: BountyType
        // The offchain key of the quest
        pub let key: String
        // The community belongs to
        pub let communityId: UInt64
        // get Bounty Entity
        pub fun getBountyEntity(): &AnyStruct{BountyEntityPublic};
        // To simple string uid
        pub fun toString(): String {
            return self.communityId.toString().concat(":").concat(self.key)
        }
    }

    pub struct interface BountyEntityPublic {
        pub let category: BountyType
        // The offchain key of the quest
        pub let key: String
        // The community belongs to
        pub let communityId: UInt64

        // display
        pub fun getStandardDisplay(): MetadataViews.Display
        // To simple string uid
        pub fun toString(): String {
            return self.communityId.toString().concat(":").concat(self.key)
        }
    }

    pub struct interface QuestInfoPublic {
        pub fun getDetail(): QuestDetail
    }

    pub struct QuestDetail {
        pub let steps: UInt64
        pub let stepsCfg: String

        init(
            steps: UInt64,
            stepsCfg: String,
        ) {
            self.steps = steps
            self.stepsCfg = stepsCfg
        }
    }

    pub struct interface ChallengeInfoPublic {
        pub fun getDetail(): ChallengeDetail
    }

    pub struct ChallengeDetail {
        pub let quests: [AnyStruct{BountyEntityIdentifier}]
        pub let achievement: Helper.EventIdentifier?;

        init(
            quests: [AnyStruct{BountyEntityIdentifier}],
            achievement: Helper.EventIdentifier?
        ) {
            self.quests = quests
            self.achievement = achievement
        }
    }

    // =================== Competition ====================

    pub enum UnlockConditionTypes: UInt8 {
        pub case CompletedAmount
        pub case MinimumLevel
        pub case TimeLimited
        pub case AchievementRequired
        pub case ChallengeIndex
    }

    pub struct interface UnlockCondition {
        pub let type: UnlockConditionTypes
        pub let display: MetadataViews.Display?

        pub fun isUnlocked(_ params: {String: AnyStruct}): Bool;
    }

    // Bounty information
    pub resource interface BountyInfoPublic {
        pub fun getID(): UInt64

        pub fun getPreconditions(): [AnyStruct{UnlockCondition}]
        pub fun getIdentifier(): AnyStruct{BountyEntityIdentifier}

        pub fun getRequiredQuestKeys(): [String]

        pub fun getRewardType(): Helper.QuestRewardType
        pub fun getPointReward(): Helper.PointReward
        pub fun getFLOATReward(): Helper.FLOATReward
    }

    // Competition public interface
    pub resource interface CompetitionPublic {
        // status
        pub fun isActive(): Bool
        // information
        pub fun getSeasonId(): UInt64
        pub fun getBountyIDs(): [UInt64]
        pub fun getPrimaryBountyIDs(): [UInt64]
        pub fun borrowBountyInfo(_ bountyId: UInt64): &AnyResource{BountyInfoPublic}

        pub fun hasBountyByKey(_ key: String): Bool
        pub fun borrowQuestRef(_ questKey: String): &AnyStruct{BountyEntityPublic, QuestInfoPublic}

        access(account) fun onProfileRegistered(acct: Address)
        access(account) fun onBountyCompleted(bountyId: UInt64, acct: Address)
    }

    pub resource interface CompetitionServicePublic {
        pub fun getActiveSeasonID(): UInt64
        pub fun borrowSeason(seasonId: UInt64): &{CompetitionPublic}
        pub fun borrowLatestActiveSeason(): &{CompetitionPublic}
    }
}
