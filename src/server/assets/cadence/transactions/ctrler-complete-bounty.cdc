import Interfaces from "../../../../../cadence/dev-challenge/Interfaces.cdc"
import UserProfile from "../../../../../cadence/dev-challenge/UserProfile.cdc"
import CompetitionService from "../../../../../cadence/dev-challenge/CompetitionService.cdc"

transaction(
    target: Address,
    bountyId: UInt64,
) {
    let ctrler: &CompetitionService.SeasonPointsController

    prepare(acct: AuthAccount) {
        self.ctrler = acct.borrow<&CompetitionService.SeasonPointsController>(from: CompetitionService.ControllerStoragePath)
            ?? panic("Without controller resource")
    }

    execute {
        self.ctrler.completeBounty(acct: target, bountyId: bountyId)
    }
}
