import MetadataViews from "../../../../cadence/deps/MetadataViews.cdc"
import Helper from "../../../../cadence/dev-challenge/Helper.cdc"
import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
import QueryStructs from "../../../../cadence/dev-challenge/QueryStructs.cdc"
import Community from "../../../../cadence/dev-challenge/Community.cdc"
import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

pub fun main(
  seasonId: UInt64,
  keys: [String],
): [QueryStructs.BountyInfo] {
  let service = CompetitionService.borrowServicePublic()
  let season = service.borrowSeasonDetail(seasonId: seasonId)

  let bounties: [QueryStructs.BountyInfo] = []
  for key in keys {
    let bounty = season.borrowBountyInfoByKey(key)
    let identifier = bounty.getBountyIdentifier()
    let rewardType = bounty.getRewardType()
    bounties.append(QueryStructs.BountyInfo(
      id: bounty.getID(),
      identifier: identifier,
      properties: bounty.getProperties(),
      display: identifier.getBountyEntity().getStandardDisplay(),
      missionDetail: identifier.category == Interfaces.BountyType.mission ? identifier.getMissionConfig().getDetail() : nil,
      challengeDetail: identifier.category == Interfaces.BountyType.challenge ? identifier.getChallengeConfig().getDetail() : nil,
      preconditions: bounty.getPreconditions(),
      participants: bounty.getParticipants(),
      participantAmt: UInt64(bounty.getParticipantsAmount()),
      rewardType: rewardType,
      pointReward: rewardType == Helper.MissionRewardType.Points ? bounty.getPointReward() : nil,
      floatReward: rewardType == Helper.MissionRewardType.FLOAT ? bounty.getFLOATReward() : nil,
    ))
  }
  return bounties
}
