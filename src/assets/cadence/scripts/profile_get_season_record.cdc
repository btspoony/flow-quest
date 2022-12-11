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
): SeasonRecord {
  let profile = UserProfile.borrowUserProfilePublic(acct)
  let questKeys = profile.getQuestsParticipanted(seasonId: seasonId)
  let questScores: {String: Interfaces.QuestStatus} = {}
  for key in questKeys {
    questScores[key] = profile.getQuestStatus(seasonId: seasonId, questKey: key)
  }
  return SeasonRecord(
    seasonId: seasonId,
    referredFromAddress: profile.getReferredFrom(seasonId: seasonId),
    referralCode: profile.getReferralCode(seasonId: seasonId),
    points: profile.getSeasonPoints(seasonId: seasonId),
    questScores: questScores,
    bountiesCompleted: profile.getBountiesCompleted(seasonId: seasonId)
  )
}

pub struct SeasonRecord {
  pub let seasonId: UInt64
  pub let referredFromAddress: Address?
  pub let referralCode: String?
  pub let points: UInt64
  pub let questScores: {String: Interfaces.QuestStatus}
  pub let bountiesCompleted: {UInt64: UFix64}

  init(
    seasonId: UInt64,
    referredFromAddress: Address?,
    referralCode: String?,
    points: UInt64,
    questScores: {String: Interfaces.QuestStatus},
    bountiesCompleted: {UInt64: UFix64},
  ) {
    self.seasonId = seasonId
    self.referredFromAddress = referredFromAddress
    self.referralCode = referralCode
    self.points = points
    self.questScores = questScores
    self.bountiesCompleted = bountiesCompleted
  }
}
