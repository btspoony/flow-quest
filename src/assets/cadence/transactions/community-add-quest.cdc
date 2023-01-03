import Community from "../../../../cadence/dev-challenge/Community.cdc"

transaction(
    communityKey: String,
    key: String,
    title: String,
    description: String,
    image: String?,
    steps: UInt64,
    stepsCfg: String,
    guideMD: String,
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
        let exist = community.borrowQuestRef(key: key)
        assert(exist == nil, message: "quest exists.")

        let quest = Community.QuestConfig(
            communityId: communityId,
            key: key,
            title: title,
            description: description,
            image: image,
            steps: steps,
            stepsCfg: stepsCfg,
            guideMD: guideMD,
        )
        community.addQuest(key: key, quest: quest)
    }
}
