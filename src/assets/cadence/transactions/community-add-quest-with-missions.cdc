import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
import Community from "../../../../cadence/dev-challenge/Community.cdc"
import Helper from "../../../../cadence/dev-challenge/Helper.cdc"

transaction(
    communityKey: String,
    key: String,
    title: String,
    description: String,
    image: String,
    // Mission
    existsMissionKeys: [String],
    newMissionKeys: [String],
    newMissionTitles: [String],
    newMissionDescriptions: [String],
    newMissionImages: [String?],
    newMissionSteps: [UInt64],
    newMissionStepsCfg: [String],
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
        newMissionKeys.length == newMissionTitles.length: "Miss match"
        newMissionKeys.length == newMissionDescriptions.length: "Miss match"
        newMissionKeys.length == newMissionImages.length: "Miss match"
        newMissionKeys.length == newMissionSteps.length: "Miss match"
        newMissionKeys.length == newMissionStepsCfg.length: "Miss match"
    }

    execute {
        let comPubRef= Community.borrowCommunityByKey(key: communityKey)
        assert(comPubRef != nil, message: "Failed to get community".concat(communityKey))
        let communityId = comPubRef!.getID()
        let community = self.builder.borrowCommunityPrivateRef(id: communityId)

        let missionKeys = existsMissionKeys
        let len = newMissionKeys.length
        var i = 0
        while i < len {
            let exist = community.borrowMissionRef(key: newMissionKeys[i])
            if exist == nil {
                let mission = Community.MissionConfig(
                    communityId: communityId,
                    key: newMissionKeys[i],
                    title: newMissionTitles[i],
                    description: newMissionDescriptions[i],
                    image: newMissionImages[i],
                    steps: newMissionSteps[i],
                    stepsCfg: newMissionStepsCfg[i],
                )
                community.addMission(key: newMissionKeys[i], mission: mission)
            }
            if !missionKeys.contains(newMissionKeys[i]) {
                missionKeys.append(newMissionKeys[i])
            }
            i = i + 1
        }

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

        let quest = Community.QuestConfig(
            communityId: communityId,
            key: key,
            title: title,
            description: description,
            image: image,
            missions: missions,
            achievement: achievement
        )
        community.addQuest(key: key, quest: quest)
    }
}
