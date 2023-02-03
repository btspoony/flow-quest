import Community from "../../../../cadence/dev-challenge/Community.cdc"

transaction(
    communityKey: String,
    keys: [String],
    title: [String],
    description: [String],
    image: [String?],
    steps: [UInt64],
    stepsCfg: [String],
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
        keys.length == title.length: "Miss match"
        keys.length == description.length: "Miss match"
        keys.length == image.length: "Miss match"
        keys.length == steps.length: "Miss match"
        keys.length == stepsCfg.length: "Miss match"
    }

    execute {
        let comPubRef= Community.borrowCommunityByKey(key: communityKey)
        assert(comPubRef != nil, message: "Failed to get community".concat(communityKey))
        let communityId = comPubRef!.getID()
        let community = self.builder.borrowCommunityPrivateRef(id: communityId)

        let len = keys.length
        var i = 0
        while i < len {
            let exist = community.borrowMissionRef(key: keys[i])
            if exist == nil {
                let mission = Community.MissionConfig(
                    communityId: communityId,
                    key: keys[i],
                    title: title[i],
                    description: description[i],
                    image: image[i],
                    steps: steps[i],
                    stepsCfg: stepsCfg[i],
                )
                community.addMission(key: keys[i], mission: mission)
            }
            i = i + 1
        }
    }
}
