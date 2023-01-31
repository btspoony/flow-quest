// import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
// import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
// import Community from "../../../../cadence/dev-challenge/Community.cdc"
// import Helper from "../../../../cadence/dev-challenge/Helper.cdc"
import BountyUnlockConditions from "../../../../cadence/dev-challenge/BountyUnlockConditions.cdc"
import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

transaction(
) {
    let admin: &CompetitionService.CompetitionAdmin
    let activeSeasonId: UInt64

    prepare(acct: AuthAccount) {
        self.admin = acct.borrow<&CompetitionService.CompetitionAdmin>(from: CompetitionService.AdminStoragePath)
            ?? panic("Without admin resource")
        self.activeSeasonId = CompetitionService.borrowServicePublic().getActiveSeasonID()
    }

    execute {
        // self.admin.
        // TODO
    }
}
