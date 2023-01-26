import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
import Community from "../../../../cadence/dev-challenge/Community.cdc"
import Helper from "../../../../cadence/dev-challenge/Helper.cdc"

transaction(
    communityKey: String,
    key: String,
    title: String,
    description: String,
    image: String,
    missionKeys: [String],
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

        let missions: [Community.BountyEntityIdentifier] = []
        for missionKey in missionKeys {
            missions.append(Community.BountyEntityIdentifier(
                Interfaces.BountyType.mission,
                communityId: communityId,
                key: missionKey,
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
            missions: missions,
            achievement: achievement
        )
        community.addChallenge(key: key, challenge: challenge)
    }
}
