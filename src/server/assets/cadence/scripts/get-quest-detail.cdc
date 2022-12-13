// import MetadataViews from "../../../../../cadence/deps/MetadataViews.cdc"
// import Helper from "../../../../../cadence/dev-challenge/Helper.cdc"
import Interfaces from "../../../../../cadence/dev-challenge/Interfaces.cdc"
// import QueryStructs from "../../../../../cadence/dev-challenge/QueryStructs.cdc"
// import UserProfile from "../../../../../cadence/dev-challenge/UserProfile.cdc"
// import CompetitionService from "../../../../../cadence/dev-challenge/CompetitionService.cdc"
import Community from "../../../../../cadence/dev-challenge/Community.cdc"

pub fun main(
  communityId: UInt64,
  questKey: String,
): Interfaces.QuestDetail {
  let community = Community.borrowCommunityById(id: communityId) ?? panic("Failed to load community")
  let quest = community.borrowQuestRef(key: questKey) ?? panic("Failed to load quest")
  return quest.getDetail()
}
