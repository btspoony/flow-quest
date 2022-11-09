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

    pub resource interface CompetitionServicePublic {

    }

    // The singleton instance of competition service
    pub resource CompetitionServiceStore: CompetitionServicePublic {
        // acesss(self) let seasons:
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
