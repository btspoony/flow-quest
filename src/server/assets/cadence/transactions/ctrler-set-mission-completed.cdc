import Interfaces from "../../../../../cadence/dev-challenge/Interfaces.cdc"
import UserProfile from "../../../../../cadence/dev-challenge/UserProfile.cdc"
import CompetitionService from "../../../../../cadence/dev-challenge/CompetitionService.cdc"

transaction(
    target: Address,
    missionKey: String,
    step: Int,
    params: {String: AnyStruct}?
) {
    let season: &{Interfaces.CompetitionPublic}
    let ctrler: &CompetitionService.SeasonPointsController

    prepare(acct: AuthAccount) {
        self.ctrler = acct.borrow<&CompetitionService.SeasonPointsController>(from: CompetitionService.ControllerStoragePath)
            ?? panic("Without controller resource")

        let service = CompetitionService.borrowServicePublic()
        self.season = service.borrowLatestActiveSeason()
    }

    execute {
        let seasonId = self.season.getSeasonId()

        if let p = params {
          self.ctrler.updateNewParams(acct: target, seasonId: seasonId, missionKey: missionKey, step: step, params: p)
        }

        self.ctrler.missionStepCompleted(acct: target, seasonId: seasonId, missionKey: missionKey, step: step)
    }
}
