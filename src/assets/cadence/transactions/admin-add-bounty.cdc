import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
import Community from "../../../../cadence/dev-challenge/Community.cdc"
import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"
import Helper from "../../../../cadence/dev-challenge/Helper.cdc"

transaction(
    communityKey: String,
    category: UInt8,
    key: String,
    rewardPoints: UInt64,
    referralPoints: UInt64,
    primary: Bool,
) {
    let admin: &CompetitionService.CompetitionAdmin

    prepare(acct: AuthAccount) {
        self.admin = acct.borrow<&CompetitionService.CompetitionAdmin>(from: CompetitionService.AdminStoragePath)
            ?? panic("Without admin resource")
    }

    execute {
        let comPubRef= Community.borrowCommunityByKey(key: communityKey)
        assert(comPubRef != nil, message: "Failed to get community".concat(communityKey))
        let communityId = comPubRef!.getID()

        let entityIdentifier = Community.BountyEntityIdentifier(
            category: Interfaces.BountyType(rawValue: category) ?? panic("Wrong category value"),
            communityId: communityId,
            key: key
        )
        // ensure exists
        entityIdentifier.getBountyEntity()

        self.admin.addBounty(
            identifier: entityIdentifier,
            preconditions: [], // FIXME: no precondition for now
            reward: Helper.PointReward(rewardPoints, referralPoints),
            primary: primary,
        )
    }
}
