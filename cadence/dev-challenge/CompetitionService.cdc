/**
## The contract of Flow dev competition

> Author: Bohao Tang<tech@btang.cn>

Join a flow development competition.
*/
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

    pub resource interface CompetitionSeasonPublic {
        pub fun isActive(): Bool
    }

    pub resource CompetitionSeason: CompetitionSeasonPublic {
        pub let endDate: UFix64

        init(
            endDate: UFix64
        ) {
            self.endDate = endDate
        }

        destroy() {
            // TODO
        }

        pub fun isActive(): Bool {
            return self.endDate > getCurrentBlock().timestamp
        }
    }

    pub resource interface CompetitionServicePublic {
        pub fun getActiveSeason(): &CompetitionSeason{CompetitionSeasonPublic}
    }

    // The singleton instance of competition service
    pub resource CompetitionServiceStore: CompetitionServicePublic {
        // all seasons in the
        access(self) var seasons: @{UInt64: CompetitionSeason}
        access(self) var currentSeasonId: UInt64

        init() {
            self.seasons <- {}
            self.currentSeasonId = 0
        }

        destroy() {
            destroy self.seasons
        }

        pub fun getActiveSeason(): &CompetitionSeason{CompetitionSeasonPublic} {
            let season = &self.seasons[self.currentSeasonId] as &CompetitionSeason{CompetitionSeasonPublic}?
                ?? panic("Failed to get current active season.")
            assert(season.isActive(), message: "The current season is not active.")
            return season
        }
    }

    // ---- Admin resource ----
    pub resource CompetitionAdmin {

    }

    pub resource SeasonPointsController {

    }

    // ---- public methods ----

    pub fun getServicePublic(): &CompetitionServiceStore{CompetitionServicePublic} {
        return self.account
            .getCapability<&CompetitionServiceStore{CompetitionServicePublic}>(self.ServicePublicPath)
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
        self.account.link<&CompetitionServiceStore{CompetitionServicePublic}>(self.ServicePublicPath, target: self.ServiceStoragePath)

        emit ContractInitialized()
    }
}
