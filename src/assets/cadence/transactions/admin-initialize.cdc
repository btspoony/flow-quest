import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
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

        // SETUP profile resource and link public
        if acct.borrow<&UserProfile.Profile>(from: UserProfile.ProfileStoragePath) == nil {
            acct.save(<- UserProfile.createUserProfile(), to: UserProfile.ProfileStoragePath)
            acct.link<&UserProfile.Profile{Interfaces.ProfilePublic}>
                (UserProfile.ProfilePublicPath, target: UserProfile.ProfileStoragePath)
        }

        let profile = acct.borrow<&UserProfile.Profile>(from: UserProfile.ProfileStoragePath) ?? panic("Missing profile")
        let admin <- service.claim(claimer: profile)
        acct.save(<- admin, to: CompetitionService.AdminStoragePath)
    }
}
