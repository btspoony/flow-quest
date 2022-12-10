import Interfaces from "../Interfaces.cdc"
import UserProfile from "../UserProfile.cdc"
import Community from "../Community.cdc"
import CompetitionService from "../CompetitionService.cdc"
import Helper from "../Helper.cdc"

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

        let season = CompetitionService.borrowServicePublic().borrowLatestActiveSeason()

        let entityIdentifier = Community.BountyEntityIdentifier(
            category: Interfaces.BountyType(rawValue: category) ?? panic("Wrong category value"),
            communityId: communityId,
            key: key
        )
        // ensure exists
        entityIdentifier.getBountyEntity()

        self.admin.addBounty(
            seasonId: season.getSeasonId(),
            identifier: entityIdentifier,
            preconditions: [], // FIXME: no precondition for now
            reward: Helper.PointReward(rewardPoints, referralPoints),
            primary: primary,
        )
    }
}
