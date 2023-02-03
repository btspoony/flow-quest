// import MetadataViews from "../../../../cadence/deps/MetadataViews.cdc"
// import Helper from "../../../../cadence/dev-challenge/Helper.cdc"
// import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
// import QueryStructs from "../../../../cadence/dev-challenge/QueryStructs.cdc"
import Community from "../../../../cadence/dev-challenge/Community.cdc"
// import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
// import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

pub fun main(
  key: String,
): CommunitySpace {
  let community = Community.borrowCommunityByKey(key: key)
    ?? panic("Failed to found community:".concat(key))
  return CommunitySpace(
    owner: community.owner!.address,
    id: community.getID(),
    key: community.key,
    display: community.getDetailedDisplay()
  )
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
