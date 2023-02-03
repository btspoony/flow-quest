// import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
// import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
// import Community from "../../../../cadence/dev-challenge/Community.cdc"
// import Helper from "../../../../cadence/dev-challenge/Helper.cdc"
import BountyUnlockConditions from "../../../../cadence/dev-challenge/BountyUnlockConditions.cdc"
import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

transaction(
    bountyId: UInt64,
    host: Address,
    eventId: UInt64,
) {
    let admin: &CompetitionService.CompetitionAdmin

    prepare(acct: AuthAccount) {
        self.admin = acct.borrow<&CompetitionService.CompetitionAdmin>(from: CompetitionService.AdminStoragePath)
            ?? panic("Without admin resource")
    }

    execute {
        self.admin.addBountyPrecondition(bountyId: bountyId, cond: BountyUnlockConditions.FLOATRequired(
            host: host,
            eventId: eventId,
        ))
    }
}
