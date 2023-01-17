import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
import Community from "../../../../cadence/dev-challenge/Community.cdc"
import Helper from "../../../../cadence/dev-challenge/Helper.cdc"

transaction(
    communityKey: String,
    key: String,
    title: String,
    description: String,
    image: String,
    // Quest
    existsQuestKeys: [String],
    newQuestKeys: [String],
    newQuestTitles: [String],
    newQuestDescriptions: [String],
    newQuestImages: [String?],
    newQuestSteps: [UInt64],
    newQuestStepsCfg: [String],
    // Achievement
    achievementHost: Address?,
    achievementId: UInt64?,
) {
    let builder: &Community.CommunityBuilder

    prepare(acct: AuthAccount) {
        if acct.borrow<&Community.CommunityBuilder>(from: Community.CommunityStoragePath) == nil {
            acct.save(<- Community.createCommunityBuilder(), to: Community.CommunityStoragePath)
            acct.link<&Community.CommunityBuilder{Community.CommunityBuilderPublic}>
                (Community.CommunityPublicPath, target: Community.CommunityStoragePath)
        }
        self.builder = acct.borrow<&Community.CommunityBuilder>(from: Community.CommunityStoragePath)!
    }

    pre {
        newQuestKeys.length == newQuestTitles.length: "Miss match"
        newQuestKeys.length == newQuestDescriptions.length: "Miss match"
        newQuestKeys.length == newQuestImages.length: "Miss match"
        newQuestKeys.length == newQuestSteps.length: "Miss match"
        newQuestKeys.length == newQuestStepsCfg.length: "Miss match"
    }

    execute {
        let comPubRef= Community.borrowCommunityByKey(key: communityKey)
        assert(comPubRef != nil, message: "Failed to get community".concat(communityKey))
        let communityId = comPubRef!.getID()
        let community = self.builder.borrowCommunityPrivateRef(id: communityId)

        let questKeys = existsQuestKeys
        let len = newQuestKeys.length
        var i = 0
        while i < len {
            let exist = community.borrowQuestRef(key: newQuestKeys[i])
            if exist == nil {
                let quest = Community.QuestConfig(
                    communityId: communityId,
                    key: newQuestKeys[i],
                    title: newQuestTitles[i],
                    description: newQuestDescriptions[i],
                    image: newQuestImages[i],
                    steps: newQuestSteps[i],
                    stepsCfg: newQuestStepsCfg[i],
                )
                community.addQuest(key: newQuestKeys[i], quest: quest)
            }
            if !questKeys.contains(newQuestKeys[i]) {
                questKeys.append(newQuestKeys[i])
            }
            i = i + 1
        }

        let quests: [Community.BountyEntityIdentifier] = []
        for questKey in questKeys {
            quests.append(Community.BountyEntityIdentifier(
                Interfaces.BountyType.quest,
                communityId: communityId,
                key: questKey,
            ))
        }

        var achievement: Helper.EventIdentifier? = nil
        if achievementHost != nil && achievementId != nil {
            achievement = Helper.EventIdentifier(achievementHost!, achievementId!)
            // ensure event exists
            achievement!.getEventPublic()
        }

        let challenge = Community.ChallengeConfig(
            communityId: communityId,
            key: key,
            title: title,
            description: description,
            image: image,
            quests: quests,
            achievement: achievement
        )
        community.addChallenge(key: key, challenge: challenge)
    }
}
