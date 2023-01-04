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
): [QueryStructs.QuestData] {
    if let community = Community.borrowCommunityByKey(key: communityKey) {
        let ret: [QueryStructs.QuestData] = []
        let searchKeyLen = searchKey.length
        let keys = community.getQuestKeys()
        for key in keys {
            if searchKeyLen <= key.length && key.slice(from: 0, upTo: searchKeyLen) == searchKey {
                if let quest = community.borrowQuestRef(key: key) {
                    ret.append(QueryStructs.QuestData(
                        identifier: Community.BountyEntityIdentifier(
                            category: Interfaces.BountyType.quest,
                            communityId: community.getID(),
                            key: key
                        ),
                        display: quest.getStandardDisplay(),
                        detail: quest.getDetail()
                    ))
                }
            }
        }
        return ret
    } else {
        return []
    }
}
