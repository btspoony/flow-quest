/**
## The contract of Flow dev competition

> Author: Bohao Tang<tech@btang.cn>

Join a flow development competition.
*/
import Interfaces from "./Interfaces.cdc"
import UserProfile from "./UserProfile.cdc"

pub contract CompetitionService {

    /**    ___  ____ ___ _  _ ____
       *   |__] |__|  |  |__| [__
        *  |    |  |  |  |  | ___]
         *************************/

    pub let AdminStoragePath: StoragePath;
    pub let AdminPublicPath: PublicPath;

    pub let ControllerStoragePath: StoragePath;
    pub let ControllerPublicPath: PublicPath;

    pub let ServiceStoragePath: StoragePath;
    pub let ServicePublicPath: PublicPath;

    /**    ____ _  _ ____ _  _ ___ ____
       *   |___ |  | |___ |\ |  |  [__
        *  |___  \/  |___ | \|  |  ___]
         ******************************/

    pub event ContractInitialized()

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

    pub struct QuestIdentifier {
        pub let seasonId: UInt64
        pub let questKey: String

        init(season: UInt64, questKey: String) {
            self.seasonId = season
            self.questKey = questKey
        }

        pub fun getConfig(): QuestConfig {
            let season = CompetitionService.getService().getSeasonRef(self.seasonId)
            return season.getQuestConfig(key: self.questKey)
        }
    }

    pub struct QuestConfig {
        // The offchain key of the quest
        pub let questKey: String
        // how many points user can obtain when quest completed
        pub let rewardPoints: UInt64
        // how many points inviter can obtain when quest completed
        pub let referalPoints: UInt64
        // Whether it can be completed repeatedly
        pub let stackable: Bool
        // how many times can be completed
        pub let limitation: UInt64

        init(
            questKey: String,
            rewardPoints: UInt64,
            referalPoints: UInt64?,
            stackable: Bool?,
            limitation: UInt64?,
        ) {
            self.questKey = questKey
            self.rewardPoints = rewardPoints
            self.referalPoints = referalPoints ?? 0
            self.stackable = stackable ?? false
            self.limitation = limitation ?? 1
        }
    }

    pub resource interface CompetitionSeasonQuestsPublic {
        pub fun getQuestKeys(): [String]
        pub fun getQuestConfig(key: String): QuestConfig
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

        access(account) fun registerProfile(acct: Address) {
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
            return self.getLatestActiveSeasonFull() as &{Interfaces.CompetitionPublic}
        }

        pub fun getLatestActiveSeasonFull(): &CompetitionSeason{CompetitionSeasonQuestsPublic, Interfaces.CompetitionPublic} {
            let season = &self.seasons[self.latestActiveSeasonId] as &CompetitionSeason{CompetitionSeasonQuestsPublic, Interfaces.CompetitionPublic}?
                ?? panic("Failed to get current active season.")
            assert(season.isActive(), message: "The current season is not active.")
            return season
        }

        access(contract) fun getSeasonRef(_ seasonId: UInt64): &CompetitionSeason {
            return &self.seasons[seasonId] as &CompetitionSeason?
                ?? panic("Failed to get the season: ".concat(seasonId.toString()))
        }

        // ---- writable methods ----

        access(contract) fun startNewSeason(
            endDate: UFix64,
            quests: [QuestConfig]
        ): UInt64 {
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
            let serviceIns = CompetitionService.getService()
            return serviceIns.startNewSeason(endDate: endDate, quests: quests)
        }

        pub fun addQuestConfig(seasonId: UInt64, quest: QuestConfig) {
            let serviceIns = CompetitionService.getService()
            let season = serviceIns.getSeasonRef(seasonId)
            season.addQuestConfig(quest: quest)
        }

        pub fun updateEndDate(seasonId: UInt64, datetime: UFix64) {
            let serviceIns = CompetitionService.getService()
            let season = serviceIns.getSeasonRef(seasonId)
            season.updateEndDate(datetime: datetime)
        }
    }

    /// Mainly used to update user profile
    pub resource SeasonPointsController {

        pub fun fetchUserQuestParameters(acct: Address, seasonId: UInt64, questKey: String): {String: AnyStruct} {
            let profileRef = getAccount(acct)
                .getCapability<&UserProfile.Profile{Interfaces.ProfilePublic}>(UserProfile.ProfilePublicPath)
                .borrow() ?? panic("Failed to borrow user profile: ".concat(acct.toString()))
            return profileRef.getLatestSeasonQuestParameters(seasonId: seasonId, questKey: questKey)
        }

        pub fun completeQuestAndDistributePoints(acct: Address, seasonId: UInt64, questKey: String) {
            // get quest config
            let serviceIns = CompetitionService.getService()
            let seasonRef = serviceIns.getSeasonRef(seasonId)
            let questCfg = seasonRef.getQuestConfig(key: questKey)

            // get profile and update points
            let profileRef = getAccount(acct)
                .getCapability<&UserProfile.Profile{Interfaces.ProfilePublic}>(UserProfile.ProfilePublicPath)
                .borrow() ?? panic("Failed to borrow user profile: ".concat(acct.toString()))
            // TODO

            // get inviter profile and update referral points
            // TODO
        }
    }

    // ---- public methods ----

    pub fun getServicePublic(): &CompetitionServiceStore{CompetitionServicePublic, Interfaces.CompetitionServicePublic} {
        return self.account
            .getCapability<&CompetitionServiceStore{CompetitionServicePublic, Interfaces.CompetitionServicePublic}>(self.ServicePublicPath)
            .borrow()
            ?? panic("Missing the capability of service store resource")
    }

    access(account) fun getService(): &CompetitionServiceStore {
        return self.account.borrow<&CompetitionServiceStore>(from: self.ServiceStoragePath)
            ?? panic("Missing the service store resource")
    }

    init() {
        // Admin resource paths
        self.AdminStoragePath = /storage/DevCompetitionAdminPathV1
        self.AdminPublicPath = /public/DevCompetitionAdminPathV1

        self.ControllerStoragePath = /storage/DevCompetitionControllerPathV1
        self.ControllerPublicPath = /public/DevCompetitionControllerPathV1

        // Store the resource of Challenge Seasons in the account
        self.ServiceStoragePath = /storage/DevCompetitionServicePathV1
        self.ServicePublicPath = /public/DevCompetitionServicePathV1
        self.account.save(<- create CompetitionServiceStore(), to: self.ServiceStoragePath)
        self.account.link<&CompetitionServiceStore{CompetitionServicePublic, Interfaces.CompetitionServicePublic}>(
            self.ServicePublicPath,
            target: self.ServiceStoragePath
        )

        emit ContractInitialized()
    }
}
