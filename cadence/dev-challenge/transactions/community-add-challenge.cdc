import Interfaces from "../Interfaces.cdc"
import Community from "../Community.cdc"
import Helper from "../Helper.cdc"

transaction(
    communityKey: String,
    key: String,
    title: String,
    description: String,
    image: String,
    questKeys: [String],
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

    execute {
        let comPubRef= Community.borrowCommunityByKey(key: communityKey)
        assert(comPubRef != nil, message: "Failed to get community".concat(communityKey))
        let communityId = comPubRef!.getID()
        let community = self.builder.borrowCommunityPrivateRef(id: communityId)

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
