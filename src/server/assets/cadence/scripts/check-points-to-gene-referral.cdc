// import MetadataViews from "../../../../../cadence/deps/MetadataViews.cdc"
// import Helper from "../../../../../cadence/dev-challenge/Helper.cdc"
// import Interfaces from "../../../../../cadence/dev-challenge/Interfaces.cdc"
// import QueryStructs from "../../../../../cadence/dev-challenge/QueryStructs.cdc"
import UserProfile from "../../../../../cadence/dev-challenge/UserProfile.cdc"
import CompetitionService from "../../../../../cadence/dev-challenge/CompetitionService.cdc"
// import Community from "../../../../../cadence/dev-challenge/Community.cdc"

pub fun main(
  acct: Address,
): Bool {
  let service = CompetitionService.borrowServicePublic()
  let seasonId = service.getActiveSeasonID()
  let season = service.borrowSeasonDetail(seasonId: seasonId)

  let profile = UserProfile.borrowUserProfilePublic(acct)
  let points = profile.getSeasonPoints(seasonId: seasonId)
  return points >= season.getReferralThreshold()
}
