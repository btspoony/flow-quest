import MetadataViews from "../../../../cadence/deps/MetadataViews.cdc"
import Helper from "../../../../cadence/dev-challenge/Helper.cdc"
import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
import QueryStructs from "../../../../cadence/dev-challenge/QueryStructs.cdc"
import Community from "../../../../cadence/dev-challenge/Community.cdc"
import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

pub fun main(
  communityId: UInt64,
): CommunityBasics {
  let community = Community.borrowCommunityById(id: communityId)
    ?? panic("Failed to found community:".concat(communityId.toString()))
  return CommunityBasics(
    owner: community.owner!.address,
    communityId: communityId,
    display: community.getDetailedDisplay()
  )
}

pub struct CommunityBasics {
  pub let owner: Address;
  pub let communityId: UInt64;
  pub let display: Community.CommunityDisplay;

  init(
    owner: Address,
    communityId: UInt64,
    display: Community.CommunityDisplay,
  ) {
    self.owner = owner
    self.communityId = communityId
    self.display = display
  }
}
