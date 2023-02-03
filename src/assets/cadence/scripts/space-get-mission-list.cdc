// import MetadataViews from "../../../../cadence/deps/MetadataViews.cdc"
// import Helper from "../../../../cadence/dev-challenge/Helper.cdc"
import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
import QueryStructs from "../../../../cadence/dev-challenge/QueryStructs.cdc"
import Community from "../../../../cadence/dev-challenge/Community.cdc"
// import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
// import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

pub fun main(
    communityKey: String,
    page: Int?,
    limit: Int?
): [QueryStructs.MissionData] {
    if let community = Community.borrowCommunityByKey(key: communityKey) {
        let keys = community.getMissionKeys()
        let totalLen = keys.length

        let pageNum = page ?? 0
        let limitNum = limit ?? 50
        let startAt = pageNum * limitNum
        if totalLen <= startAt {
            return []
        }
        let slicedKeys = keys.slice(from: startAt, upTo: startAt + limitNum < totalLen ? startAt + limitNum : totalLen)

        let ret: [QueryStructs.MissionData] = []
        for key in slicedKeys {
            if let mission = community.borrowMissionRef(key: key) {
                ret.append(QueryStructs.MissionData(
                    identifier: Community.BountyEntityIdentifier(
                        category: Interfaces.BountyType.mission,
                        communityId: community.getID(),
                        key: key
                    ),
                    display: mission.getStandardDisplay(),
                    detail: mission.getDetail()
                ))
            }
        }
        return ret
    } else {
        return []
    }
}
