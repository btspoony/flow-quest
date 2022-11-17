// import Interfaces from "../Interfaces.cdc"
// import UserProfile from "../UserProfile.cdc"
import CompetitionService from "../CompetitionService.cdc"

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
