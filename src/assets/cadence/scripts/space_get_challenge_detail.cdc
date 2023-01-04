// import MetadataViews from "../../../../cadence/deps/MetadataViews.cdc"
// import Helper from "../../../../cadence/dev-challenge/Helper.cdc"
import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
import QueryStructs from "../../../../cadence/dev-challenge/QueryStructs.cdc"
import Community from "../../../../cadence/dev-challenge/Community.cdc"
// import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
// import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

pub fun main(
    communityKey: String,
    challengeKey: String,
): ChallengeDetail? {
    if let community = Community.borrowCommunityByKey(key: communityKey) {
        if let challenge = community.borrowChallengeRef(key: challengeKey) {
            let quests: [QueryStructs.QuestData] = []
            for qid in challenge.quests {
                if let questCommunity = Community.borrowCommunityById(id: qid.communityId) {
                    if let quest = questCommunity.borrowQuestRef(key: qid.key) {
                        quests.append(QueryStructs.QuestData(
                            identifier: qid,
                            display: quest.getStandardDisplay(),
                            detail: quest.getDetail()
                        ))
                    }
                }
            } // build quest detail
            return ChallengeDetail(
                community.owner!.address,
                QueryStructs.ChallengeData(
                    identifier: Community.BountyEntityIdentifier(
                        category: Interfaces.BountyType.challenge,
                        communityId: community.getID(),
                        key: challengeKey
                    ),
                    display: challenge.getStandardDisplay(),
                    detail: challenge.getDetail()
                ),
                quests
            )
        }
    }
    return nil
}

pub struct ChallengeDetail {
    pub let owner: Address
    pub let challenge: QueryStructs.ChallengeData
    pub let quests: [QueryStructs.QuestData]

    init(
        _ owner: Address,
        _ challenge: QueryStructs.ChallengeData,
        _ quests: [QueryStructs.QuestData]
    ) {
        self.owner = owner
        self.challenge = challenge
        self.quests = quests
    }
}
