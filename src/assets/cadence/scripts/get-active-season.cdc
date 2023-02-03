import MetadataViews from "../../../../cadence/deps/MetadataViews.cdc"
import Helper from "../../../../cadence/dev-challenge/Helper.cdc"
import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
import QueryStructs from "../../../../cadence/dev-challenge/QueryStructs.cdc"
import Community from "../../../../cadence/dev-challenge/Community.cdc"
import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

pub fun main(
    includeUnlaunched: Bool?
): ResultInfo {
    let service = CompetitionService.borrowServicePublic()

    let willIncludeUnlaunched = includeUnlaunched ?? false

    let bountyIDs = service.getPrimaryBountyIDs()
    let bounties: {UInt64: QueryStructs.BountyInfo} = {}
    for id in bountyIDs {
        let bounty = service.borrowBountyDetail(id)
        let identifier = bounty.getBountyIdentifier()
        let rewardType = bounty.getRewardType()
        if !willIncludeUnlaunched && !bounty.isLaunched() {
            continue
        }
        bounties[id] = QueryStructs.BountyInfo(
            id: id,
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

    let season = service.borrowLastActiveSeason()

    return ResultInfo(
        seasonID: season?.getSeasonId(),
        endDate: season?.getEndDate(),
        referralThreshold: season?.getReferralThreshold(),
        bounties: bounties
    )
}

pub struct ResultInfo {
    pub let seasonID: UInt64?
    pub let endDate: UFix64?
    pub let referralThreshold: UInt64?
    pub let bounties: {UInt64: QueryStructs.BountyInfo}

    init(
        seasonID: UInt64?,
        endDate: UFix64?,
        referralThreshold: UInt64?,
        bounties: {UInt64: QueryStructs.BountyInfo}
    ) {
        self.seasonID = seasonID
        self.endDate = endDate
        self.referralThreshold = referralThreshold
        self.bounties = bounties
    }
}
