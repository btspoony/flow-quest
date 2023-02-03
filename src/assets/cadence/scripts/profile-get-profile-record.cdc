import MetadataViews from "../../../../cadence/deps/MetadataViews.cdc"
import Helper from "../../../../cadence/dev-challenge/Helper.cdc"
import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
import QueryStructs from "../../../../cadence/dev-challenge/QueryStructs.cdc"
import Community from "../../../../cadence/dev-challenge/Community.cdc"
import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

pub fun main(
  acct: Address,
): ProfileRecord {
  let profile = UserProfile.borrowUserProfilePublic(acct)

  let missionKeys = profile.getMissionsParticipanted()
  let missionScores: {String: Interfaces.MissionStatus} = {}
  for key in missionKeys {
    missionScores[key] = profile.getMissionStatus(missionKey: key)
  }
  let seasonKeys = profile.getSeasonsJoined()
  let seasonPoints: {UInt64: UInt64} = {}
  for seasonId in seasonKeys {
    seasonPoints[seasonId] = profile.getSeasonPoints(seasonId: seasonId)
  }
  return ProfileRecord(
    referredFromAddress: profile.getReferredFrom(),
    referralCode: profile.getReferralCode(),
    points: profile.getProfilePoints(),
    seasonPoints: seasonPoints,
    missionScores: missionScores,
    bountiesCompleted: profile.getBountiesCompleted()
  )
}

pub struct ProfileRecord {
  pub let referredFromAddress: Address?
  pub let referralCode: String?
  pub let points: UInt64
  pub let seasonPoints: {UInt64: UInt64}
  pub let missionScores: {String: Interfaces.MissionStatus}
  pub let bountiesCompleted: {UInt64: UFix64}

  init(
    referredFromAddress: Address?,
    referralCode: String?,
    points: UInt64,
    seasonPoints: {UInt64: UInt64},
    missionScores: {String: Interfaces.MissionStatus},
    bountiesCompleted: {UInt64: UFix64},
  ) {
    self.referredFromAddress = referredFromAddress
    self.referralCode = referralCode
    self.points = points
    self.seasonPoints = seasonPoints
    self.missionScores = missionScores
    self.bountiesCompleted = bountiesCompleted
  }
}
