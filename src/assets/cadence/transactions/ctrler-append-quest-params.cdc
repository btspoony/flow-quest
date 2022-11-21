import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

transaction(
    target: Address,
    questKey: String,
    params: {String: AnyStruct}
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

        self.ctrler.appendNewParams(
            acct: target,
            seasonId: seasonId,
            questKey: questKey,
            params: params
        )
    }
}
