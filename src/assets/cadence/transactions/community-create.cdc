import Community from "../../../../cadence/dev-challenge/Community.cdc"

transaction(
    key: String,
    name: String,
    description: String,
    image: String,
    banner: String?,
    twitter: String?,
    discord: String?,
    website: String?,
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
        let socials: {String: String} = {}
        if twitter != nil {
            socials["twitter"] = twitter!
        }
        if discord != nil {
            socials["discord"] = discord!
        }
        if website != nil {
            socials["website"] = website!
        }
        self.builder.createCommunity(key: key, name: name, description: description, image: image, banner: banner, socials: socials)
    }
}
