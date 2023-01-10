// import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
// import Community from "../../../../cadence/dev-challenge/Community.cdc"
import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"
// import Helper from "../../../../cadence/dev-challenge/Helper.cdc"

transaction {
    prepare(acct: AuthAccount) {
        assert(
            acct.borrow<&CompetitionService.CompetitionAdmin>(from: CompetitionService.AdminStoragePath) == nil,
            message: "Admin resource exists"
        )

        let service = CompetitionService.borrowServicePublic()

        if let profile = acct.borrow<&UserProfile.Profile>(from: UserProfile.ProfileStoragePath) {
            let admin <- service.claim(claimer: profile)
            acct.save(<- admin, to: CompetitionService.AdminStoragePath)
        } else {
            panic("No user profile for:".concat(acct.address.toString()))
        }
    }
}
