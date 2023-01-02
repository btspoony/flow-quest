// import MetadataViews from "../../../../cadence/deps/MetadataViews.cdc"
// import Helper from "../../../../cadence/dev-challenge/Helper.cdc"
// import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
// import QueryStructs from "../../../../cadence/dev-challenge/QueryStructs.cdc"
import Community from "../../../../cadence/dev-challenge/Community.cdc"
// import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
// import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

pub fun main(
    acct: Address
): [CommunitySpace] {
    if let builder = getAccount(acct)
        .getCapability<&Community.CommunityBuilder{Community.CommunityBuilderPublic}>(Community.CommunityPublicPath)
        .borrow() {
        let ret: [CommunitySpace] = []
        let allIDs = builder.getIDs()
        for id in allIDs {
            let community = builder.borrowCommunity(id: id)
            ret.append(CommunitySpace(
                owner: acct,
                id: id,
                key: community.key,
                display: community.getDetailedDisplay()
            ))
        }
        return ret
    } else {
        return []
    }
}

pub struct CommunitySpace {
  pub let owner: Address;
  pub let id: UInt64;
  pub let key: String;
  pub let display: Community.CommunityDisplay;

  init(
    owner: Address,
    id: UInt64,
    key: String,
    display: Community.CommunityDisplay,
  ) {
    self.owner = owner
    self.id = id
    self.key = key
    self.display = display
  }
}
