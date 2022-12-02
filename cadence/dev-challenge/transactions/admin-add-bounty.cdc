import Interfaces from "../Interfaces.cdc"
import UserProfile from "../UserProfile.cdc"
import Community from "../Community.cdc"
import CompetitionService from "../CompetitionService.cdc"
import Helper from "../Helper.cdc"

transaction(
    seasonId: UInt64,
    communityId: UInt64,
    category: UInt8,
    key: String,
    rewardPoints: UInt64,
    referralPoints: UInt64,
) {
    let admin: &CompetitionService.CompetitionAdmin

    prepare(acct: AuthAccount) {
        self.admin = acct.borrow<&CompetitionService.CompetitionAdmin>(from: CompetitionService.AdminStoragePath)
            ?? panic("Without admin resource")
    }

    execute {
        let entityIdentifier = Community.BountyEntityIdentifier(
            category: Interfaces.BountyType(rawValue: category) ?? panic("Wrong category value"),
            communityId: communityId,
            key: key
        )
        // ensure exists
        entityIdentifier.getBountyEntity()

        self.admin.addBounty(
            seasonId: seasonId,
            identifier: entityIdentifier,
            preconditions: [], // FIXME: no precondition for now
            reward: Helper.PointReward(rewardPoints, referralPoints)
        )
    }
}
