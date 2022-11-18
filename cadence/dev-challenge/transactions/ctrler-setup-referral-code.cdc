import Interfaces from "../Interfaces.cdc"
import UserProfile from "../UserProfile.cdc"
import CompetitionService from "../CompetitionService.cdc"

transaction(
    target: Address,
) {
    let season: &CompetitionService.CompetitionSeason{CompetitionService.CompetitionSeasonQuestsPublic, Interfaces.CompetitionPublic}
    let ctrler: &CompetitionService.SeasonPointsController

    prepare(acct: AuthAccount) {
        self.ctrler = acct.borrow<&CompetitionService.SeasonPointsController>(from: CompetitionService.ControllerStoragePath)
            ?? panic("Without controller resource")

        let service = CompetitionService.borrowServicePublic()
        self.season = service.getLatestActiveSeasonFull()
    }

    execute {
        let seasonId = self.season.getId()

        self.ctrler.setupReferralCode(acct: target, seasonId: seasonId)
    }
}
