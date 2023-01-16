import MetadataViews from "../../../../cadence/deps/MetadataViews.cdc"
import Helper from "../../../../cadence/dev-challenge/Helper.cdc"
import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
import QueryStructs from "../../../../cadence/dev-challenge/QueryStructs.cdc"
import Community from "../../../../cadence/dev-challenge/Community.cdc"
import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

pub fun main(
    includeUnlaunched: Bool?
): SessonInfo {
    let service = CompetitionService.borrowServicePublic()
    let activeSeasonId = service.getActiveSeasonID()
    let season = service.borrowSeasonDetail(seasonId: activeSeasonId)

    let willIncludeUnlaunched = includeUnlaunched ?? false

    let bountyIDs = season.getPrimaryBountyIDs()
    let bounties: {UInt64: QueryStructs.BountyInfo} = {}
    for id in bountyIDs {
        let bounty = season.borrowBountyDetail(id)
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
            questDetail: identifier.category == Interfaces.BountyType.quest ? identifier.getQuestConfig().getDetail() : nil,
            challengeDetail: identifier.category == Interfaces.BountyType.challenge ? identifier.getChallengeConfig().getDetail() : nil,
            preconditions: bounty.getPreconditions(),
            participants: bounty.getParticipants(),
            participantAmt: UInt64(bounty.getParticipantsAmount()),
            rewardType: rewardType,
            pointReward: rewardType == Helper.QuestRewardType.Points ? bounty.getPointReward() : nil,
            floatReward: rewardType == Helper.QuestRewardType.FLOAT ? bounty.getFLOATReward() : nil,
        )
    }

    return SessonInfo(
        seasonID: season.getSeasonId(),
        endDate: season.getEndDate(),
        referralThreshold: season.getReferralThreshold(),
        bounties: bounties
    )
}

pub struct SessonInfo {
    pub let seasonID: UInt64
    pub let endDate: UFix64
    pub let referralThreshold: UInt64
    pub let bounties: {UInt64: QueryStructs.BountyInfo}

    init(
        seasonID: UInt64,
        endDate: UFix64,
        referralThreshold: UInt64,
        bounties: {UInt64: QueryStructs.BountyInfo}
    ) {
        self.seasonID = seasonID
        self.endDate = endDate
        self.referralThreshold = referralThreshold
        self.bounties = bounties
    }
}
