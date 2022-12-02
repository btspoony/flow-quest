/**
## The contract of Flow dev competition

> Author: Bohao Tang<tech@btang.cn>

Join a flow development competition.
*/
import Interfaces from "./Interfaces.cdc"
import Helper from "./Helper.cdc"
import UserProfile from "./UserProfile.cdc"
import Community from "./Community.cdc"

pub contract CompetitionService {

    /**    ___  ____ ___ _  _ ____
       *   |__] |__|  |  |__| [__
        *  |    |  |  |  |  | ___]
         *************************/

    pub let AdminStoragePath: StoragePath;
    pub let ControllerStoragePath: StoragePath;

    pub let ServiceStoragePath: StoragePath;
    pub let ServicePublicPath: PublicPath;

    /**    ____ _  _ ____ _  _ ___ ____
       *   |___ |  | |___ |\ |  |  [__
        *  |___  \/  |___ | \|  |  ___]
         ******************************/

    pub event ContractInitialized()

    pub event SeasonBountyAdded(seasonId: UInt64, communityId: UInt64, key: String, category: UInt8)
    pub event BountyCompleted(seasonId: UInt64, communityId: UInt64, key: String, category: UInt8, participant: Address)
    pub event ProfileRegistered(seasonId: UInt64, participant: Address)
    pub event SeasonEndDateUpdated(seasonId: UInt64, datetime: UFix64)

    pub event SeasonCreated(seasonId: UInt64)

    /**    ____ ___ ____ ___ ____
       *   [__   |  |__|  |  |___
        *  ___]  |  |  |  |  |___
         ************************/

    // NOTHING

    /**    ____ _  _ _  _ ____ ___ _ ____ _  _ ____ _    _ ___ _   _
       *   |___ |  | |\ | |     |  | |  | |\ | |__| |    |  |   \_/
        *  |    |__| | \| |___  |  | |__| | \| |  | |___ |  |    |
         ***********************************************************/

    pub resource BountyInfo: Interfaces.BountyInfoPublic {
        pub let seasonId: UInt64
        access(contract) let preconditions: [AnyStruct{Interfaces.UnlockCondition}]
        access(contract) let participants: {Address: {String: AnyStruct}}
        access(contract) let identifier: Community.BountyEntityIdentifier
        access(contract) let rewardInfo: AnyStruct{Helper.RewardInfo}
        access(contract) let rewardType: Helper.QuestRewardType

        init(
            seasonId: UInt64,
            identifier: Community.BountyEntityIdentifier,
            preconditions: [AnyStruct{Interfaces.UnlockCondition}],
            reward: AnyStruct{Helper.RewardInfo}
        ) {
            self.seasonId = seasonId
            self.identifier = identifier
            self.preconditions = preconditions
            self.rewardType = reward.type
            self.rewardInfo = reward
            self.participants = {}
        }

        // ---- readonly methods ----

        pub fun getPreconditions(): [AnyStruct{Interfaces.UnlockCondition}] {
            return self.preconditions
        }

        pub fun getParticipants(): {Address: {String: AnyStruct}} {
            return self.participants
        }

        pub fun getIdentifier(): AnyStruct{Interfaces.BountyEntityIdentifier} {
            return self.identifier
        }

        pub fun getRequiredQuestKeys(): [String] {
            let ret: [String] = []
            if self.identifier.category == Interfaces.BountyType.quest {
                ret.append(self.identifier.toString())
            } else {
                let challenge = self.identifier.getChallengeConfig()
                for one in challenge.quests {
                    ret.append(one.toString())
                }
            }
            return ret
        }

        pub fun getRewardType(): Helper.QuestRewardType {
            return self.rewardType
        }

        pub fun getPointReward(): Helper.PointReward {
            if self.rewardType == Helper.QuestRewardType.Points {
                return self.rewardInfo as! Helper.PointReward
            }
            panic("Reward type is not Points")
        }

        pub fun getFLOATReward(): Helper.FLOATReward {
            if self.rewardType == Helper.QuestRewardType.FLOAT {
                return self.rewardInfo as! Helper.FLOATReward
            }
            panic("Reward type is not FLOAT")
        }

        // ---- writable methods ----

        pub fun onParticipantCompleted(acct: Address) {
            let now = getCurrentBlock().timestamp
            if self.participants[acct] == nil {
                self.participants[acct] = {
                    "datetime": now,
                    "updatedAt": now,
                    "times": UInt64(1)
                }
            } else {
                let record = (&self.participants[acct] as &{String: AnyStruct}?)!
                record["updatedAt"] = now
                record["times"] = (record["times"] as! UInt64?)! + 1
            }

            emit BountyCompleted(
                seasonId: self.seasonId,
                communityId: self.identifier.communityId,
                key: self.identifier.key,
                category: self.identifier.category.rawValue,
                participant: acct
            )
        }

        // ---- internal methods ----

        // check if the bounty unlocked
        access(contract) fun isUnlocked(): Bool {
            var unlocked = true
            for cond in self.preconditions {
                unlocked = unlocked && cond.isUnlocked()
            }
            return unlocked
        }
    }

    pub resource CompetitionSeason: Interfaces.CompetitionPublic {
        pub var endDate: UFix64
        access(contract) var profiles: {Address: Bool}
        access(contract) var bounties: @{UInt64: BountyInfo}
        // QuestKey -> CommunityID
        access(self) var questCommunityMapping: {String: UInt64}

        init(
            endDate: UFix64,
        ) {
            self.endDate = endDate
            self.profiles = {}
            self.bounties <- {}
            self.questCommunityMapping = {}
        }

        destroy() {
            destroy self.bounties
        }

        // ---- readonly methods ----

        pub fun getSeasonId(): UInt64 {
            return self.uuid
        }

        pub fun isActive(): Bool {
            return self.endDate > getCurrentBlock().timestamp
        }

        pub fun getBountyIDs(): [UInt64] {
            return self.bounties.keys
        }

        pub fun borrowBountyInfo(_ bountyId: UInt64): &AnyResource{Interfaces.BountyInfoPublic} {
            return self.borrowBountyPrivateRef(bountyId)
        }

        pub fun borrowQuestRef(_ questKey: String): &AnyStruct{Interfaces.BountyEntityPublic, Interfaces.QuestInfoPublic} {
            let communityId = self.questCommunityMapping[questKey] ?? panic("Missing questKey.")
            let questIdentifier = Community.BountyEntityIdentifier(
                category: Interfaces.BountyType.quest,
                communityId: communityId,
                key: questKey
            )
            return questIdentifier.getQuestConfig()
        }

        // ---- writable methods ----

        access(account) fun onProfileRegistered(acct: Address) {
            pre {
                self.profiles[acct] == nil: "Profile registered."
            }
            self.profiles[acct] = true

            emit ProfileRegistered(
                seasonId: self.getSeasonId(),
                participant: acct,
            )
        }

        access(account) fun onBountyCompleted(bountyId: UInt64, acct: Address) {
            let bounty = &self.bounties[bountyId] as &BountyInfo? ?? panic("Failed to borrow bounty")
            bounty.onParticipantCompleted(acct: acct)
        }

        access(contract) fun updateEndDate(datetime: UFix64) {
            pre {
                datetime > getCurrentBlock().timestamp: "Cannot update end date before now."
            }
            self.endDate = datetime

            emit SeasonEndDateUpdated(
                seasonId: self.getSeasonId(),
                datetime: datetime,
            )
        }

        access(contract) fun addBounty(
            identifier: Community.BountyEntityIdentifier,
            preconditions: [AnyStruct{Interfaces.UnlockCondition}],
            reward: AnyStruct{Helper.RewardInfo}
        ) {
            pre {
                self.questCommunityMapping[identifier.key] == nil: "Quest is registered."
            }
            self.questCommunityMapping[identifier.key] = identifier.communityId
            let bounty <- create BountyInfo(
                seasonId: self.uuid,
                identifier: identifier,
                preconditions: preconditions,
                reward: reward
            )
            let uid = bounty.uuid
            self.bounties[bounty.uuid] <-! bounty

            emit SeasonBountyAdded(
                seasonId: self.uuid,
                communityId: identifier.communityId,
                key: identifier.key,
                category: identifier.category.rawValue,
            )
        }

        // ---- internal methods ----

        access(contract) fun borrowBountyPrivateRef(_ bountyId: UInt64): &BountyInfo {
            return &self.bounties[bountyId] as &BountyInfo? ?? panic("Failed to borrow bounty")
        }

        // check if the bounty unlocked
        access(contract) fun isBountyUnlocked(_ bountyId: UInt64): Bool {
            let bounty = self.borrowBountyPrivateRef(bountyId)
            return bounty.isUnlocked()
        }
    }

    // The singleton instance of competition service
    pub resource CompetitionServiceStore: Interfaces.CompetitionServicePublic {
        // all seasons in the
        access(self) var latestActiveSeasonId: UInt64
        access(self) var seasons: @{UInt64: CompetitionSeason}

        init() {
            self.seasons <- {}
            self.latestActiveSeasonId = 0
        }

        destroy() {
            destroy self.seasons
        }

        // ---- factory methods ----

        pub fun createCompetitionAdmin(): @CompetitionAdmin {
            return <- create CompetitionAdmin()
        }

        pub fun createSeasonPointsController(): @SeasonPointsController {
            return <- create SeasonPointsController()
        }

        // ---- readonly methods ----

        pub fun borrowSeason(seasonId: UInt64): &{Interfaces.CompetitionPublic} {
            return self.borrowSeasonPrivateRef(seasonId)
        }

        pub fun borrowLatestActiveSeason(): &{Interfaces.CompetitionPublic} {
            let season = &self.seasons[self.latestActiveSeasonId] as &CompetitionSeason{Interfaces.CompetitionPublic}?
                ?? panic("Failed to get current active season.")
            assert(season.isActive(), message: "The current season is not active.")
            return season
        }

        access(contract) fun borrowSeasonPrivateRef(_ seasonId: UInt64): &CompetitionSeason {
            return &self.seasons[seasonId] as &CompetitionSeason?
                ?? panic("Failed to get the season: ".concat(seasonId.toString()))
        }

        // ---- writable methods ----

        access(contract) fun startNewSeason(
            endDate: UFix64
        ): UInt64 {
            // ensure one time one season
            if self.latestActiveSeasonId != 0 {
                let season = &self.seasons[self.latestActiveSeasonId] as &CompetitionSeason? ?? panic("Failed to found last season")
                assert(!season.isActive(), message: "Last season is active")
            }

            let season <- create CompetitionSeason(
                endDate: endDate,
            )
            let seasonId = season.uuid
            self.seasons[seasonId] <-! season
            self.latestActiveSeasonId = seasonId

            emit SeasonCreated(seasonId: seasonId)
            return seasonId
        }
    }

    // ---- Admin resource ----

    /// Mainly used to manage competition
    pub resource CompetitionAdmin {

        pub fun startNewSeason(endDate: UFix64): UInt64 {
            let serviceIns = CompetitionService.borrowServiceRef()
            return serviceIns.startNewSeason(endDate: endDate)
        }

        pub fun addBounty(
            seasonId: UInt64,
            identifier: Community.BountyEntityIdentifier,
            preconditions: [AnyStruct{Interfaces.UnlockCondition}],
            reward: AnyStruct{Helper.RewardInfo}
        ) {
            let serviceIns = CompetitionService.borrowServiceRef()
            let season = serviceIns.borrowSeasonPrivateRef(seasonId)
            season.addBounty(identifier: identifier, preconditions: preconditions, reward: reward)
        }

        pub fun updateEndDate(
            seasonId: UInt64,
            datetime: UFix64
        ) {
            let serviceIns = CompetitionService.borrowServiceRef()
            let season = serviceIns.borrowSeasonPrivateRef(seasonId)
            season.updateEndDate(datetime: datetime)
        }
    }

    /// Mainly used to update user profile
    pub resource SeasonPointsController {

        pub fun updateNewParams(acct: Address, seasonId: UInt64, questKey: String, step: Int, params: {String: AnyStruct}) {
            // get profile and update points
            let profileRef = UserProfile.borrowUserProfilePublic(acct)
            profileRef.updateQuestNewParams(seasonId: seasonId, questKey: questKey, step: step, params: params)
        }

        pub fun questStepCompleted(acct: Address, seasonId: UInt64, bountyId: UInt64, questKey: String, step: Int) {
            // get quest config
            let serviceIns = CompetitionService.borrowServiceRef()
            let seasonRef = serviceIns.borrowSeasonPrivateRef(seasonId)
            let quest = seasonRef.borrowQuestRef(questKey)

            // get profile and update points
            let profileRef = UserProfile.borrowUserProfilePublic(acct)
            profileRef.updateQuestVerificationResult(seasonId: seasonId, questKey: questKey, step: step, result: true)
        }

        pub fun questStepFailure(acct: Address, seasonId: UInt64, bountyId: UInt64, questKey: String, step: Int) {
            let serviceIns = CompetitionService.borrowServiceRef()
            let seasonRef = serviceIns.borrowSeasonPrivateRef(seasonId)
            let quest = seasonRef.borrowQuestRef(questKey)

            // get profile and update points
            let profileRef = UserProfile.borrowUserProfilePublic(acct)
            profileRef.updateQuestVerificationResult(seasonId: seasonId, questKey: questKey, step: step, result: false)
        }

        pub fun completeBounty(acct: Address, seasonId: UInt64, bountyId: UInt64, step: Int) {
            let serviceIns = CompetitionService.borrowServiceRef()
            let seasonRef = serviceIns.borrowSeasonPrivateRef(seasonId)
            let bounty = seasonRef.borrowBountyPrivateRef(bountyId)
            // ensure bounty unlocked
            assert(bounty.isUnlocked(), message: "Bounty is locked")

            // get profile and update points
            let profileRef = UserProfile.borrowUserProfilePublic(acct)

            // ensure quest completed
            if bounty.identifier.category == Interfaces.BountyType.quest {
                let completedTimes = profileRef.getQuestCompletedTimes(seasonId: seasonId, questKey: bounty.identifier.key)
                assert(completedTimes > 0, message: "Quset not completed")
            } else {
                let challengeRef = bounty.identifier.getChallengeConfig()
                var allCompleted = true
                for identifier in challengeRef.quests {
                    let completedTimes = profileRef.getQuestCompletedTimes(seasonId: seasonId, questKey: identifier.key)
                    allCompleted = allCompleted && completedTimes > 0
                }
                assert(allCompleted, message: "Challenge not completed")
            }

            // distribute rewards
            if bounty.rewardType == Helper.QuestRewardType.Points {
                let reward = bounty.getPointReward()
                self.addPoints(acct: acct, seasonId: seasonId, points: reward.rewardPoints)

                // get inviter profile and update referral points
                let referralFrom = profileRef.getReferredFrom(seasonId: seasonId)
                if referralFrom != nil && reward.referralPoints > 0 {
                    self.addPoints(acct: referralFrom!, seasonId: seasonId, points: reward.referralPoints)
                }
            } else {
                // NOTHING for now
            }

            profileRef.completeBounty(seasonId: seasonId, bountyId: bountyId)
        }

        pub fun setupReferralCode(acct: Address, seasonId: UInt64) {
            // get profile and update points
            let profileRef = UserProfile.borrowUserProfilePublic(acct)
            profileRef.setupReferralCode(seasonId: seasonId)
        }

        access(self) fun addPoints(acct: Address, seasonId: UInt64, points: UInt64) {
            // get profile and update points
            let profileRef = UserProfile.borrowUserProfilePublic(acct)
            profileRef.addPoints(seasonId: seasonId, points: points)
        }
    }

    // ---- public methods ----

    pub fun borrowServicePublic(): &CompetitionServiceStore{Interfaces.CompetitionServicePublic} {
        return self.account
            .getCapability<&CompetitionServiceStore{Interfaces.CompetitionServicePublic}>(self.ServicePublicPath)
            .borrow()
            ?? panic("Missing the capability of service store resource")
    }

    pub fun getPublicCapability(): Capability<&{Interfaces.CompetitionServicePublic}> {
        return self.account.getCapability<&{Interfaces.CompetitionServicePublic}>(self.ServicePublicPath)
    }

    access(account) fun borrowServiceRef(): &CompetitionServiceStore {
        return self.account.borrow<&CompetitionServiceStore>(from: self.ServiceStoragePath)
            ?? panic("Missing the service store resource")
    }

    init() {
        // Admin resource paths
        self.AdminStoragePath = /storage/DevCompetitionAdminPathV1
        self.ControllerStoragePath = /storage/DevCompetitionControllerPathV1
        self.ServiceStoragePath = /storage/DevCompetitionServicePathV1
        self.ServicePublicPath = /public/DevCompetitionServicePathV1

        let store <- create CompetitionServiceStore()
        // Store admin and controller resources
        self.account.save(<- store.createCompetitionAdmin(), to: self.AdminStoragePath)
        self.account.save(<- store.createSeasonPointsController(), to: self.ControllerStoragePath)
        // Store the resource of Challenge Seasons in the account
        self.account.save(<- store, to: self.ServiceStoragePath)
        self.account.link<&CompetitionServiceStore{Interfaces.CompetitionServicePublic}>(
            self.ServicePublicPath,
            target: self.ServiceStoragePath
        )

        emit ContractInitialized()
    }
}
