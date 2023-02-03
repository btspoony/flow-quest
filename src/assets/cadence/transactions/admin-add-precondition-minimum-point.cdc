// import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
// import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
// import Community from "../../../../cadence/dev-challenge/Community.cdc"
// import Helper from "../../../../cadence/dev-challenge/Helper.cdc"
import BountyUnlockConditions from "../../../../cadence/dev-challenge/BountyUnlockConditions.cdc"
import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

transaction(
    bountyId: UInt64,
    amount: UInt64,
    usePermanentPoint: Bool,
) {
    let admin: &CompetitionService.CompetitionAdmin

    prepare(acct: AuthAccount) {
        self.admin = acct.borrow<&CompetitionService.CompetitionAdmin>(from: CompetitionService.AdminStoragePath)
            ?? panic("Without admin resource")
    }

    execute {
        var seasonId: UInt64 = 0;
        if !usePermanentPoint {
            let service = CompetitionService.borrowServicePublic()
            seasonId = service.getActiveSeasonID()
        }

        self.admin.addBountyPrecondition(bountyId: bountyId, cond: BountyUnlockConditions.MinimumPointRequired(
            seasonId: seasonId,
            amount: amount
        ))
    }
}
