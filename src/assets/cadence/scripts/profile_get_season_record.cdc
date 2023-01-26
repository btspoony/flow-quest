import MetadataViews from "../../../../cadence/deps/MetadataViews.cdc"
import Helper from "../../../../cadence/dev-challenge/Helper.cdc"
import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
import QueryStructs from "../../../../cadence/dev-challenge/QueryStructs.cdc"
import Community from "../../../../cadence/dev-challenge/Community.cdc"
import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

pub fun main(
  acct: Address,
  seasonId: UInt64?,
): SeasonRecord {
  let profile = UserProfile.borrowUserProfilePublic(acct)

  var ensureSeasonId = seasonId
  if ensureSeasonId == nil {
    ensureSeasonId = CompetitionService.borrowServicePublic().getActiveSeasonID()
  }
  let profileSeasonId = ensureSeasonId ?? panic("No seasson id")

  let missionKeys = profile.getMissionsParticipanted(seasonId: profileSeasonId)
  let missionScores: {String: Interfaces.MissionStatus} = {}
  for key in missionKeys {
    missionScores[key] = profile.getMissionStatus(seasonId: profileSeasonId, missionKey: key)
  }
  return SeasonRecord(
    seasonId: profileSeasonId,
    referredFromAddress: profile.getReferredFrom(seasonId: profileSeasonId),
    referralCode: profile.getReferralCode(seasonId: profileSeasonId),
    points: profile.getSeasonPoints(seasonId: profileSeasonId),
    missionScores: missionScores,
    bountiesCompleted: profile.getBountiesCompleted(seasonId: profileSeasonId)
  )
}

pub struct SeasonRecord {
  pub let seasonId: UInt64
  pub let referredFromAddress: Address?
  pub let referralCode: String?
  pub let points: UInt64
  pub let missionScores: {String: Interfaces.MissionStatus}
  pub let bountiesCompleted: {UInt64: UFix64}

  init(
    seasonId: UInt64,
    referredFromAddress: Address?,
    referralCode: String?,
    points: UInt64,
    missionScores: {String: Interfaces.MissionStatus},
    bountiesCompleted: {UInt64: UFix64},
  ) {
    self.seasonId = seasonId
    self.referredFromAddress = referredFromAddress
    self.referralCode = referralCode
    self.points = points
    self.missionScores = missionScores
    self.bountiesCompleted = bountiesCompleted
  }
}
