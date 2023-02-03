// import MetadataViews from "../../../../cadence/deps/MetadataViews.cdc"
// import Helper from "../../../../cadence/dev-challenge/Helper.cdc"
import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
import QueryStructs from "../../../../cadence/dev-challenge/QueryStructs.cdc"
import Community from "../../../../cadence/dev-challenge/Community.cdc"
// import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
// import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

pub fun main(
    communityKey: String,
    searchKey: String,
): [QueryStructs.MissionData] {
    if let community = Community.borrowCommunityByKey(key: communityKey) {
        let ret: [QueryStructs.MissionData] = []
        let searchKeyLen = searchKey.length
        let keys = community.getMissionKeys()
        for key in keys {
            if searchKeyLen <= key.length && key.slice(from: 0, upTo: searchKeyLen) == searchKey {
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
        }
        return ret
    } else {
        return []
    }
}
