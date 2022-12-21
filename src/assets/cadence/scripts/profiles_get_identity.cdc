// import MetadataViews from "../../../../cadence/deps/MetadataViews.cdc"
// import Helper from "../../../../cadence/dev-challenge/Helper.cdc"
import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
// import QueryStructs from "../../../../cadence/dev-challenge/QueryStructs.cdc"
// import Community from "../../../../cadence/dev-challenge/Community.cdc"
import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
// import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

pub fun main(
    accts: [Address],
): [ProfileIdentifier] {
    let ret: [ProfileIdentifier] = []
    for acct in accts {
        let profile = UserProfile.borrowUserProfilePublic(acct)
        let availableIdentities = profile.getIdentities()
        if availableIdentities.length > 0 {
            ret.append(ProfileIdentifier(
                acct: acct,
                identity: availableIdentities[0]
            ))
        }
    }
    return ret
}


pub struct ProfileIdentifier {
    pub let account: Address
    pub let identity: Interfaces.LinkedIdentity

    init(
        acct: Address,
        identity: Interfaces.LinkedIdentity
    ) {
        self.account = acct
        self.identity = identity
    }
}
