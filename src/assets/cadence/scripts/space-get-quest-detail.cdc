// import MetadataViews from "../../../../cadence/deps/MetadataViews.cdc"
// import Helper from "../../../../cadence/dev-challenge/Helper.cdc"
import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
import QueryStructs from "../../../../cadence/dev-challenge/QueryStructs.cdc"
import Community from "../../../../cadence/dev-challenge/Community.cdc"
// import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
// import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

pub fun main(
    communityKey: String,
    questKey: String,
): QuestDetail? {
    if let community = Community.borrowCommunityByKey(key: communityKey) {
        var quest = community.borrowQuestRef(key: questKey)
        if quest == nil {
            let questKeys = community.getQuestKeys()
            let searchKeyLen = questKey.length
            for key in questKeys {
                if searchKeyLen <= key.length && key.slice(from: 0, upTo: searchKeyLen) == questKey {
                    quest = community.borrowQuestRef(key: key)
                    break
                }
            }
        }
        if quest == nil {
            return nil
        }

        let missions: [QueryStructs.MissionData] = []
        for qid in quest!.missions {
            if let community = Community.borrowCommunityById(id: qid.communityId) {
                if let mission = community.borrowMissionRef(key: qid.key) {
                    missions.append(QueryStructs.MissionData(
                        identifier: qid,
                        display: mission.getStandardDisplay(),
                        detail: mission.getDetail()
                    ))
                }
            }
        } // build mission detail
        return QuestDetail(
            community.owner!.address,
            QueryStructs.QuestData(
                identifier: Community.BountyEntityIdentifier(
                    category: Interfaces.BountyType.quest,
                    communityId: community.getID(),
                    key: quest!.key
                ),
                display: quest!.getStandardDisplay(),
                detail: quest!.getDetail()
            ),
            missions
        )
    }
    return nil
}

pub struct QuestDetail {
    pub let owner: Address
    pub let quest: QueryStructs.QuestData
    pub let missions: [QueryStructs.MissionData]

    init(
        _ owner: Address,
        _ quest: QueryStructs.QuestData,
        _ missions: [QueryStructs.MissionData]
    ) {
        self.owner = owner
        self.quest = quest
        self.missions = missions
    }
}
