// import MetadataViews from "../../../../../cadence/deps/MetadataViews.cdc"
// import Helper from "../../../../../cadence/dev-challenge/Helper.cdc"
// import Interfaces from "../../../../../cadence/dev-challenge/Interfaces.cdc"
// import QueryStructs from "../../../../../cadence/dev-challenge/QueryStructs.cdc"
import UserProfile from "../../../../../cadence/dev-challenge/UserProfile.cdc"
// import CompetitionService from "../../../../../cadence/dev-challenge/CompetitionService.cdc"
// import Community from "../../../../../cadence/dev-challenge/Community.cdc"

pub fun main(
  acct: Address,
  platform: String
): String {
    let profile = UserProfile.borrowUserProfilePublic(acct)
    let identity = profile.getIdentity(platform: platform)
    return identity.uid
}
