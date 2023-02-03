import MetadataViews from "../../../../cadence/deps/MetadataViews.cdc"
import Helper from "../../../../cadence/dev-challenge/Helper.cdc"
import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
import QueryStructs from "../../../../cadence/dev-challenge/QueryStructs.cdc"
import Community from "../../../../cadence/dev-challenge/Community.cdc"
import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

pub fun main(
  bountyId: UInt64,
): QueryStructs.BountyInfo {
  let service = CompetitionService.borrowServicePublic()

  let bounty = service.borrowBountyDetail(bountyId)
  let identifier = bounty.getBountyIdentifier()
  let rewardType = bounty.getRewardType()
  return QueryStructs.BountyInfo(
    id: bounty.getID(),
    identifier: identifier,
    properties: bounty.getProperties(),
    display: identifier.getBountyEntity().getStandardDisplay(),
    missionDetail: identifier.category == Interfaces.BountyType.mission ? identifier.getMissionConfig().getDetail() : nil,
    questDetail: identifier.category == Interfaces.BountyType.quest ? identifier.getQuestConfig().getDetail() : nil,
    preconditions: bounty.getPreconditions(),
    participants: bounty.getParticipants(),
    participantAmt: UInt64(bounty.getParticipantsAmount()),
    rewardType: rewardType,
    pointReward: rewardType == Helper.MissionRewardType.Points ? bounty.getPointReward() : nil,
    floatReward: rewardType == Helper.MissionRewardType.FLOAT ? bounty.getFLOATReward() : nil,
  )
}
