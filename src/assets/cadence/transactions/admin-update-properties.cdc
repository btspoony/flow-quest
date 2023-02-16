import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

transaction(
    endDate: UFix64?,
    title: String?,
    rankingRewards: String?,
) {
    let admin: &CompetitionService.CompetitionAdmin

    prepare(acct: AuthAccount) {
        self.admin = acct.borrow<&CompetitionService.CompetitionAdmin>(from: CompetitionService.AdminStoragePath)
            ?? panic("Without admin resource")
    }

    execute {
        let seasonId = CompetitionService.borrowServicePublic().getActiveSeasonID()

        if endDate != nil {
            self.admin.updateEndDate(seasonId: seasonId, datetime: endDate!)
        }

        if title != nil {
            self.admin.updateSeasonPropertyString(seasonId: seasonId, property: CompetitionService.CompetitionProperty.Title, value: title!)
        }

        if rankingRewards != nil {
            self.admin.updateSeasonPropertyString(seasonId: seasonId, property: CompetitionService.CompetitionProperty.RankingRewards, value: rankingRewards!)
        }
    }
}
