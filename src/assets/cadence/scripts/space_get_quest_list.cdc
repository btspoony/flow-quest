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
): [QueryStructs.QuestData] {
    if let community = Community.borrowCommunityByKey(key: communityKey) {
        let keys = community.getQuestKeys()
        let totalLen = keys.length

        let pageNum = page ?? 0
        let limitNum = limit ?? 50
        let startAt = pageNum * limitNum
        if totalLen <= startAt {
            return []
        }
        let slicedKeys = keys.slice(from: startAt, upTo: startAt + limitNum < totalLen ? startAt + limitNum : totalLen)

        let ret: [QueryStructs.QuestData] = []
        for key in slicedKeys {
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
        return ret
    } else {
        return []
    }
}
