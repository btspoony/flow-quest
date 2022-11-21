// import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
// import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

transaction {
    prepare(service: AuthAccount, acct: AuthAccount) {
        assert(
            acct.borrow<&CompetitionService.SeasonPointsController>(from: CompetitionService.ControllerStoragePath) == nil,
            message: "SeasonPointsController resource should be nil"
        )

        let service = service.borrow<&CompetitionService.CompetitionServiceStore>(from: CompetitionService.ServiceStoragePath)
            ?? panic("Not the service account.")

        acct.save(<- service.createSeasonPointsController(), to: CompetitionService.ControllerStoragePath)
    }
}
