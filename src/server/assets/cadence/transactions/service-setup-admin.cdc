// import Interfaces from "../../../../../cadence/dev-challenge/Interfaces.cdc"
// import UserProfile from "../../../../../cadence/dev-challenge/UserProfile.cdc"
import CompetitionService from "../../../../../cadence/dev-challenge/CompetitionService.cdc"

transaction {
    prepare(service: AuthAccount, acct: AuthAccount) {
        assert(
            acct.borrow<&CompetitionService.CompetitionAdmin>(from: CompetitionService.AdminStoragePath) == nil,
            message: "Admin resource should be nil"
        )

        let service = service.borrow<&CompetitionService.CompetitionServiceStore>(from: CompetitionService.ServiceStoragePath)
            ?? panic("Not the service account.")

        acct.save(<- service.createCompetitionAdmin(), to: CompetitionService.AdminStoragePath)
    }
}
