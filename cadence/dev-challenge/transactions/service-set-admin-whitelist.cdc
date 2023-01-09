// import Interfaces from "../Interfaces.cdc"
// import UserProfile from "../UserProfile.cdc"
import CompetitionService from "../CompetitionService.cdc"

transaction(
    target: Address,
    valid: Bool
) {
    prepare(service: AuthAccount) {
        let service = service.borrow<&CompetitionService.CompetitionServiceStore>(from: CompetitionService.ServiceStoragePath)
            ?? panic("Not the service account.")

        service.updateWhitelistFlag(addr: target, flag: valid)
    }
}
