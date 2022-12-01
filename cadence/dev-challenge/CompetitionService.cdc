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

    pub event BountyCompleted(seasonId: UInt64, communityId: UInt64, key: String, category: UInt8, participant: Address)

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
        access(self) let rewardInfo: AnyStruct{Helper.RewardInfo}
        access(self) let rewardType: Helper.QuestRewardType

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
                ret.append(self.identifier.communityId.toString().concat(":").concat(self.identifier.key))
            } else {
                let challenge = self.identifier.getChallengeConfig()
                for one in challenge.quests {
                    ret.append(one.communityId.toString().concat(":").concat(one.key))
                }
            }
            return ret
        }

        pub fun getRewardType(): Helper.QuestRewardType {
            return self.rewardType
        }

        pub fun getPointReward(): Helper.PointReward? {
            if self.rewardType == Helper.QuestRewardType.Points {
                return self.rewardInfo as! Helper.PointReward
            }
            return nil
        }

        pub fun getFLOATReward(): Helper.FLOATReward? {
            if self.rewardType == Helper.QuestRewardType.FLOAT {
                return self.rewardInfo as! Helper.FLOATReward
            }
            return nil
        }

        // ---- writable methods ----

        pub fun onParticipantComplete(acct: Address) {
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
    }

    pub resource interface CompetitionSeasonQuestsPublic {
        // TODO
    }

    pub resource CompetitionSeason: CompetitionSeasonQuestsPublic, Interfaces.CompetitionPublic {
        pub var endDate: UFix64
        access(contract) var quests: {String: QuestConfig}
        access(contract) var profiles: {Address: Bool}

        init(
            endDate: UFix64,
            quests: [QuestConfig]
        ) {
            self.endDate = endDate
            self.quests = {}
            self.profiles = {}
        }

        // ---- readonly methods ----

        pub fun getId(): UInt64 {
            return self.uuid
        }

        pub fun isActive(): Bool {
            return self.endDate > getCurrentBlock().timestamp
        }

        pub fun getQuestKeys(): [String] {
            return self.quests.keys
        }

        pub fun getQuestConfig(key: String): QuestConfig {
            return self.quests[key] ?? panic("Missing quest of key: ".concat(key))
        }

        // ---- writable methods ----

        access(account) fun onProfileRegistered(acct: Address) {
            pre {
                self.profiles[acct] == nil: "Profile registered."
            }
            self.profiles[acct] = true
        }

        access(contract) fun addQuestConfig(quest: QuestConfig) {
            pre {
                self.quests[quest.questKey] == nil: "Quest exists"
            }
            self.quests[quest.questKey] = quest
        }

        access(contract) fun updateEndDate(datetime: UFix64) {
            pre {
                datetime > getCurrentBlock().timestamp: "Cannot update end date before now."
            }
            self.endDate = datetime
        }

        // ---- internal methods ----
    }

    pub resource interface CompetitionServicePublic {
        pub fun getLatestActiveSeasonFull(): &CompetitionSeason{CompetitionSeasonQuestsPublic, Interfaces.CompetitionPublic}
    }

    // The singleton instance of competition service
    pub resource CompetitionServiceStore: CompetitionServicePublic, Interfaces.CompetitionServicePublic {
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

        pub fun getLatestActiveSeason(): &{Interfaces.CompetitionPublic} {
            return self.getLatestActiveSeasonFull()
        }

        pub fun getLatestActiveSeasonFull(): &CompetitionSeason{CompetitionSeasonQuestsPublic, Interfaces.CompetitionPublic} {
            let season = &self.seasons[self.latestActiveSeasonId] as &CompetitionSeason{CompetitionSeasonQuestsPublic, Interfaces.CompetitionPublic}?
                ?? panic("Failed to get current active season.")
            assert(season.isActive(), message: "The current season is not active.")
            return season
        }

        access(contract) fun borrowSeasonRef(_ seasonId: UInt64): &CompetitionSeason {
            return &self.seasons[seasonId] as &CompetitionSeason?
                ?? panic("Failed to get the season: ".concat(seasonId.toString()))
        }

        // ---- writable methods ----

        access(contract) fun startNewSeason(
            endDate: UFix64,
            quests: [QuestConfig]
        ): UInt64 {
            // ensure one time one season
            if self.latestActiveSeasonId != 0 {
                let season = &self.seasons[self.latestActiveSeasonId] as &CompetitionSeason? ?? panic("Failed to found last season")
                assert(!season.isActive(), message: "Last season is active")
            }

            let season <- create CompetitionSeason(
                endDate: endDate,
                quests: quests,
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

        pub fun startNewSeason(endDate: UFix64, quests: [QuestConfig]): UInt64 {
            let serviceIns = CompetitionService.borrowServiceRef()
            return serviceIns.startNewSeason(endDate: endDate, quests: quests)
        }

        pub fun addQuestConfig(seasonId: UInt64, quest: QuestConfig) {
            let serviceIns = CompetitionService.borrowServiceRef()
            let season = serviceIns.borrowSeasonRef(seasonId)
            season.addQuestConfig(quest: quest)
        }

        pub fun updateEndDate(seasonId: UInt64, datetime: UFix64) {
            let serviceIns = CompetitionService.borrowServiceRef()
            let season = serviceIns.borrowSeasonRef(seasonId)
            season.updateEndDate(datetime: datetime)
        }
    }

    /// Mainly used to update user profile
    pub resource SeasonPointsController {

        pub fun questCompletedAndDistributePoints(acct: Address, seasonId: UInt64, questKey: String) {
            // get quest config
            let serviceIns = CompetitionService.borrowServiceRef()
            let seasonRef = serviceIns.borrowSeasonRef(seasonId)
            let questCfg = seasonRef.getQuestConfig(key: questKey)

            // get profile and update points
            let profileRef = UserProfile.borrowUserProfilePublic(acct)
            let paramsIndex = profileRef.getLatestSeasonQuestIndex(seasonId: seasonId, questKey: questKey)
            let timesCompleted = profileRef.getTimesCompleted(seasonId: seasonId, questKey: questKey)

            assert(timesCompleted == 0 || (questCfg.stackable && timesCompleted < questCfg.limitation), message: "Cannot complete more times.")

            self.updateQuestVerificationResult(acct: acct, seasonId: seasonId, questKey: questKey, idx: paramsIndex, result: true)
            self.addPoints(acct: acct, seasonId: seasonId, points: questCfg.rewardPoints)

            // get inviter profile and update referral points
            let referralFrom = profileRef.getReferredFrom(seasonId: seasonId)
            if referralFrom != nil && questCfg.referalPoints > 0 {
                self.addPoints(acct: referralFrom!, seasonId: seasonId, points: questCfg.referalPoints)
            }
        }

        pub fun questFailure(acct: Address, seasonId: UInt64, questKey: String) {
            // get profile and update points
            let profileRef = UserProfile.borrowUserProfilePublic(acct)
            let paramsIndex = profileRef.getLatestSeasonQuestIndex(seasonId: seasonId, questKey: questKey)
            self.updateQuestVerificationResult(acct: acct, seasonId: seasonId, questKey: questKey, idx: paramsIndex, result: false)
        }

        pub fun appendNewParams(acct: Address, seasonId: UInt64, questKey: String, params: {String: AnyStruct}) {
            // get profile and update points
            let profileRef = UserProfile.borrowUserProfilePublic(acct)
            profileRef.appendNewParams(seasonId: seasonId, questKey: questKey, params: params)
        }

        pub fun setupReferralCode(acct: Address, seasonId: UInt64) {
            // get profile and update points
            let profileRef = UserProfile.borrowUserProfilePublic(acct)
            profileRef.setupReferralCode(seasonId: seasonId)
        }

        access(contract) fun addPoints(acct: Address, seasonId: UInt64, points: UInt64) {
            // get profile and update points
            let profileRef = UserProfile.borrowUserProfilePublic(acct)
            profileRef.addPoints(seasonId: seasonId, points: points)
        }

        access(contract) fun updateQuestVerificationResult(acct: Address, seasonId: UInt64, questKey: String, idx: Int, result: Bool) {
            // get profile and update points
            let profileRef = UserProfile.borrowUserProfilePublic(acct)
            profileRef.updateVerificationResult(seasonId: seasonId, questKey: questKey, idx: idx, result: result)
        }
    }

    // ---- public methods ----

    pub fun borrowServicePublic(): &CompetitionServiceStore{CompetitionServicePublic, Interfaces.CompetitionServicePublic} {
        return self.account
            .getCapability<&CompetitionServiceStore{CompetitionServicePublic, Interfaces.CompetitionServicePublic}>(self.ServicePublicPath)
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
        self.account.link<&CompetitionServiceStore{CompetitionServicePublic, Interfaces.CompetitionServicePublic}>(
            self.ServicePublicPath,
            target: self.ServiceStoragePath
        )

        emit ContractInitialized()
    }
}
