import Interfaces from "../Interfaces.cdc"
import UserProfile from "../UserProfile.cdc"
import CompetitionService from "../CompetitionService.cdc"

transaction(
    referredFrom: String?
) {
    let profile: &UserProfile.Profile

    prepare(acct: AuthAccount) {
        // SETUP profile resource and link public
        if acct.borrow<&UserProfile.Profile>(from: UserProfile.ProfileStoragePath) == nil {
            acct.save(<- UserProfile.createUserProfile(), to: UserProfile.ProfileStoragePath)
            acct.link<&UserProfile.Profile{Interfaces.ProfilePublic}>
                (UserProfile.ProfilePublicPath, target: UserProfile.ProfileStoragePath)
        }

        self.profile = acct.borrow<&UserProfile.Profile>(from: UserProfile.ProfileStoragePath)
            ?? panic("Failed to find profile resource.")
    }

    execute {
        self.profile.registerForNewSeason(serviceCap: CompetitionService.getPublicCapability(), referredFrom: referredFrom)
    }
}
