import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
import Community from "../../../../cadence/dev-challenge/Community.cdc"
import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"
import Helper from "../../../../cadence/dev-challenge/Helper.cdc"

transaction(
    communityIds: [UInt64],
    keys: [String],
    categories: [UInt8],
    rewardPoints: [UInt64],
    referralPoints: [UInt64],
    primary: [Bool],
) {
    let admin: &CompetitionService.CompetitionAdmin

    prepare(acct: AuthAccount) {
        self.admin = acct.borrow<&CompetitionService.CompetitionAdmin>(from: CompetitionService.AdminStoragePath)
            ?? panic("Without admin resource")
    }

    pre {
        keys.length == communityIds.length: "Miss match"
        keys.length == categories.length: "Miss match"
        keys.length == rewardPoints.length: "Miss match"
        keys.length == referralPoints.length: "Miss match"
        keys.length == primary.length: "Miss match"
    }

    execute {
        let service = CompetitionService.borrowServicePublic()

        let len = keys.length
        var i = 0
        while i < len {
            if !service.hasBountyByKey(keys[i]) {
                let entityIdentifier = Community.BountyEntityIdentifier(
                    category: Interfaces.BountyType(rawValue: categories[i]) ?? panic("Wrong category value"),
                    communityId: communityIds[i],
                    key: keys[i]
                )
                // ensure exists
                entityIdentifier.getBountyEntity()

                self.admin.addBounty(
                    identifier: entityIdentifier,
                    preconditions: [],
                    reward: Helper.PointReward(rewardPoints[i], referralPoints[i]),
                    primary: primary[i],
                )
            }
            i = i + 1
        }
    }
}
