// import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
// import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
// import Community from "../../../../cadence/dev-challenge/Community.cdc"
import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"
// import Helper from "../../../../cadence/dev-challenge/Helper.cdc"

transaction(
    bountyId: UInt64,
    propertyKey: UInt8,
    propertyValue: Bool,
) {
    let admin: &CompetitionService.CompetitionAdmin

    prepare(acct: AuthAccount) {
        self.admin = acct.borrow<&CompetitionService.CompetitionAdmin>(from: CompetitionService.AdminStoragePath)
            ?? panic("Without admin resource")
    }

    execute {
        let property = CompetitionService.BountyProperty(rawValue: propertyKey) ?? panic("Invalid property key")
        let season = CompetitionService.borrowServicePublic().borrowLatestActiveSeason()

        self.admin.updateBountyProperty(
            seasonId: season.getSeasonId(),
            bountyId: bountyId,
            property: property,
            value: propertyValue
        )
    }
}
