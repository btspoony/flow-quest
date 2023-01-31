import Interfaces from "../../../../../cadence/dev-challenge/Interfaces.cdc"
import UserProfile from "../../../../../cadence/dev-challenge/UserProfile.cdc"
import CompetitionService from "../../../../../cadence/dev-challenge/CompetitionService.cdc"

transaction(
    target: Address,
    missionKey: String,
    step: Int,
    params: {String: AnyStruct}?
) {
    let ctrler: &CompetitionService.SeasonPointsController

    prepare(acct: AuthAccount) {
        self.ctrler = acct.borrow<&CompetitionService.SeasonPointsController>(from: CompetitionService.ControllerStoragePath)
            ?? panic("Without controller resource")
    }

    execute {
        if let p = params {
          self.ctrler.updateNewParams(acct: target, missionKey: missionKey, step: step, params: p)
        }

        self.ctrler.missionStepCompleted(acct: target, missionKey: missionKey, step: step)
    }
}
