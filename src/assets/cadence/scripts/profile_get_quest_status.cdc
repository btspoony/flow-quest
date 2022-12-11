import MetadataViews from "../../../../cadence/deps/MetadataViews.cdc"
import Helper from "../../../../cadence/dev-challenge/Helper.cdc"
import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
import QueryStructs from "../../../../cadence/dev-challenge/QueryStructs.cdc"
import Community from "../../../../cadence/dev-challenge/Community.cdc"
import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

pub fun main(
  acct: Address,
  seasonId: UInt64,
  questKey: String,
): Interfaces.QuestStatus {
  let profile = UserProfile.borrowUserProfilePublic(acct)
  return profile.getQuestStatus(seasonId: seasonId, questKey: questKey)
}
