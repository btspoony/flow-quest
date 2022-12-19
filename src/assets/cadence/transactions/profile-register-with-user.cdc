import MetadataViews from "../../../../cadence/deps/MetadataViews.cdc"
import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

transaction(
    referredFrom: Address?,
    platform: String?,
    userId: String?,
    userName: String?,
    userBio: String?,
    userImage: String?,
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
        // update profile identity
        if platform != nil && userId != nil && userName != nil && userBio != nil && userImage != nil {
            let identity = Interfaces.LinkedIdentity(
                platform: platform!,
                uid: userId!,
                display: MetadataViews.Display(
                    name: userName!,
                    description: userBio!,
                    thumbnail: MetadataViews.HTTPFile(url: userImage!)
                )
            )
            self.profile.upsertIdentity(platform: platform!, identity: identity)
        }

        // register new season
        self.profile.registerForNewSeason(serviceCap: CompetitionService.getPublicCapability(), referredFrom: referredFrom)
    }
}
