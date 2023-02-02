import FLOAT from "../../../../cadence/deps/FLOAT.cdc"
import NonFungibleToken from "../../../../cadence/deps/NonFungibleToken.cdc"
import MetadataViews from "../../../../cadence/deps/MetadataViews.cdc"
import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

transaction(
    referredFrom: Address?
) {
    let profile: &UserProfile.Profile

    prepare(acct: AuthAccount) {
        // SETUP COLLECTION
        if acct.borrow<&FLOAT.Collection>(from: FLOAT.FLOATCollectionStoragePath) == nil {
            acct.save(<- FLOAT.createEmptyCollection(), to: FLOAT.FLOATCollectionStoragePath)
            acct.link<&FLOAT.Collection{NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection, FLOAT.CollectionPublic}>
                    (FLOAT.FLOATCollectionPublicPath, target: FLOAT.FLOATCollectionStoragePath)
        }

        // SETUP profile resource and link public
        if acct.borrow<&UserProfile.Profile>(from: UserProfile.ProfileStoragePath) == nil {
            acct.save(
                <- UserProfile.createUserProfile(serviceCap: CompetitionService.getPublicCapability(), referredFrom),
                to: UserProfile.ProfileStoragePath
            )
            acct.link<&UserProfile.Profile{Interfaces.ProfilePublic}>
                (UserProfile.ProfilePublicPath, target: UserProfile.ProfileStoragePath)
        }

        self.profile = acct.borrow<&UserProfile.Profile>(from: UserProfile.ProfileStoragePath)
            ?? panic("Failed to find profile resource.")
    }

    execute {
        let service = CompetitionService.borrowServicePublic()
        if let season = service.borrowLastActiveSeason() {
            // register new season
            let seasonId = season.getSeasonId()
            if !self.profile.isRegistered(seasonId: seasonId) {
                self.profile.registerForNewSeason(seasonId: seasonId)
            }
        }
    }
}
