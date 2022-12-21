// import MetadataViews from "../../../../cadence/deps/MetadataViews.cdc"
// import Helper from "../../../../cadence/dev-challenge/Helper.cdc"
// import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
// import QueryStructs from "../../../../cadence/dev-challenge/QueryStructs.cdc"
// import Community from "../../../../cadence/dev-challenge/Community.cdc"
import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

pub fun main(
    limit: Int?,
    acct: Address?,
): RankingStatus {
    let service = CompetitionService.borrowServicePublic()
    let activeSeasonId = service.getActiveSeasonID()
    let season = service.borrowSeasonDetail(seasonId: activeSeasonId)

    let tops = season.getLeaderboardRanking(limit: limit)
    var rank: Int? = nil
    var point: UInt64? = nil
    if let address = acct {
        rank = season.getRank(address)
        let profile = UserProfile.borrowUserProfilePublic(address)
        point = profile.getSeasonPoints(seasonId: activeSeasonId)
    }
    return RankingStatus(tops, rank, point)
}

pub struct RankingStatus {
    pub let tops: {UInt64: [Address]}
    pub let accountRank: Int?
    pub let accountPoint: UInt64?

    init(
        _ tops: {UInt64: [Address]},
        _ rank: Int?,
        _ point: UInt64?
    ) {
        self.tops = tops
        self.accountRank = rank
        self.accountPoint = point
    }
}
