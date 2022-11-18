import Interfaces from "../Interfaces.cdc"
import UserProfile from "../UserProfile.cdc"
import CompetitionService from "../CompetitionService.cdc"

transaction(
    target: Address,
    questKey: String,
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

        self.ctrler.questFailure(
            acct: target,
            seasonId: seasonId,
            questKey: questKey
        )
    }
}
