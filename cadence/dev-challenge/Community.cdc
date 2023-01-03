/**
## The contract of Community

> Author: Bohao Tang<tech@btang.cn>

*/
import MetadataViews from "../deps/MetadataViews.cdc"
import Interfaces from "./Interfaces.cdc"
import Helper from "./Helper.cdc"

pub contract Community {

    /**    ___  ____ ___ _  _ ____
       *   |__] |__|  |  |__| [__
        *  |    |  |  |  |  | ___]
         *************************/
    pub let CommunityStoragePath: StoragePath;
    pub let CommunityPublicPath: PublicPath;

    /**    ____ _  _ ____ _  _ ___ ____
       *   |___ |  | |___ |\ |  |  [__
        *  |___  \/  |___ | \|  |  ___]
         ******************************/

    pub event ContractInitialized()

    pub event QuestCreated(key: String, communityId: UInt64, owner: Address, steps: UInt64)
    pub event ChallengeCreated(key: String, communityId: UInt64, owner: Address, questKeys: [String], achievementHost: Address?, achievementId: UInt64?)
    pub event ChallengeAchievementUpdated(key: String, communityId: UInt64, owner: Address, achievementHost: Address, achievementId: UInt64)

    pub event CommunityCreated(id: UInt64, key: String, owner: Address, name: String, description: String, image: String)
    pub event CommunityUpdateBasics(id: UInt64, owner: Address, name: String, description: String, image: String, banner: String?)
    pub event CommunityUpdateSocial(id: UInt64, owner: Address, key: String, value: String)

    /**    ____ ___ ____ ___ ____
       *   [__   |  |__|  |  |___
        *  ___]  |  |  |  |  |___
         ************************/

    access(contract) let communityIdMapping: {UInt64: Address}
    access(contract) let communityKeyMapping: {String: UInt64}
    access(contract) let entityMapping: {String: Address}

    /**    ____ _  _ _  _ ____ ___ _ ____ _  _ ____ _    _ ___ _   _
       *   |___ |  | |\ | |     |  | |  | |\ | |__| |    |  |   \_/
        *  |    |__| | \| |___  |  | |__| | \| |  | |___ |  |    |
         ***********************************************************/

    /**
    The identifier of BountyEntity
    */
    pub struct BountyEntityIdentifier: Interfaces.BountyEntityIdentifier {
        pub let category: Interfaces.BountyType
        pub let communityId: UInt64
        pub let key: String

        init(
            category: Interfaces.BountyType,
            communityId: UInt64,
            key: String
        ) {
            self.category = category
            self.communityId = communityId
            self.key = key
        }

        pub fun getBountyEntity(): &AnyStruct{Interfaces.BountyEntityPublic} {
            if self.category == Interfaces.BountyType.challenge {
                return self.getChallengeConfig()
            } else {
                return self.getQuestConfig()
            }
        }

        pub fun getQuestConfig(): &QuestConfig {
            let community = self.getOwnerCommunity()
            return community.borrowQuestRef(key: self.key) ?? panic("Failed to borrow quest.")
        }

        pub fun getChallengeConfig(): &ChallengeConfig {
            let community = self.getOwnerCommunity()
            return community.borrowChallengeRef(key: self.key) ?? panic("Failed to borrow challenge.")
        }

        access(self) fun getOwnerCommunity(): &CommunityIns{CommunityPublic} {
            let owner = Community.entityMapping[self.key] ?? panic("Failed to found owner address")
            return Community.borrowCommunity(host: owner, id: self.communityId) ?? panic("Failed to borrow community.")
        }
    }

    pub struct QuestConfig: Interfaces.BountyEntityPublic, Interfaces.QuestInfoPublic {
        pub let category: Interfaces.BountyType
        pub let communityId: UInt64
        pub let key: String
        pub let title: String
        pub let description: String
        pub let image: String?
        pub let steps: UInt64
        pub let extra: {String: String}
        // changable
        pub var stepsCfg: MetadataViews.HTTPFile
        pub var guideMD: MetadataViews.HTTPFile

        init(
            communityId: UInt64,
            key: String,
            title: String,
            description: String,
            image: String?,
            steps: UInt64,
            stepsCfg: String,
            guideMD: String,
        ) {
            self.category = Interfaces.BountyType.quest
            self.communityId = communityId
            self.key = key
            self.title = title
            self.description = description
            self.image = image
            // details
            self.steps = steps
            // changable
            self.extra = {}
            self.stepsCfg = MetadataViews.HTTPFile(stepsCfg)
            self.guideMD = MetadataViews.HTTPFile(guideMD)
        }

        // display
        pub fun getStandardDisplay(): MetadataViews.Display {
            var thumbnail: {MetadataViews.File}? = nil
            if self.image != nil {
                thumbnail = MetadataViews.HTTPFile(url: "https://nftstorage.link/ipfs/".concat(self.image!))
            } else {
                let ref = Community.borrowCommunityById(id: self.communityId)
                    ?? panic("Community not found")
                thumbnail = ref.getStandardDisplay().thumbnail
            }
            return MetadataViews.Display(
                name: self.title,
                description: self.description,
                thumbnail: thumbnail!
            )
        }

        pub fun getDetail(): Interfaces.QuestDetail {
            return Interfaces.QuestDetail(
                steps: self.steps,
                stepsCfg: self.stepsCfg.uri(),
                guideMD: self.guideMD.uri()
            )
        }

        // update extra data
        access(contract) fun updateExtra(toMerge: {String: String}) {
            for key in toMerge.keys {
                self.extra[key] = toMerge[key]
            }
        }

        access(contract) fun updateQuestStepsCfg(stepsCfg: String) {
            self.stepsCfg = MetadataViews.HTTPFile(stepsCfg)
        }

        access(contract) fun updateQuestGuideMD(guideMD: String) {
            self.guideMD = MetadataViews.HTTPFile(guideMD)
        }
    }

    pub struct ChallengeConfig: Interfaces.BountyEntityPublic, Interfaces.ChallengeInfoPublic {
        pub let category: Interfaces.BountyType
        pub let communityId: UInt64
        pub let key: String
        pub let title: String
        pub let description: String
        pub let image: String
        pub let quests: [AnyStruct{Interfaces.BountyEntityIdentifier}]
        pub var achievement: Helper.EventIdentifier?

        init(
            communityId: UInt64,
            key: String,
            title: String,
            description: String,
            image: String,
            quests: [BountyEntityIdentifier],
            achievement: Helper.EventIdentifier?
        ) {
            self.category = Interfaces.BountyType.challenge
            self.communityId = communityId
            self.key = key
            self.title = title
            self.description = description
            self.image = image
            // details
            self.quests = quests
            self.achievement = achievement
        }

        // display
        pub fun getStandardDisplay(): MetadataViews.Display {
            return MetadataViews.Display(
                name: self.title,
                description: self.description,
                thumbnail: MetadataViews.HTTPFile(url: "https://nftstorage.link/ipfs/".concat(self.image))
            )
        }

        pub fun getDetail(): Interfaces.ChallengeDetail {
            return Interfaces.ChallengeDetail(
                quests: self.quests,
                achievement: self.achievement
            )
        }

        access(contract) fun updateAchievement(achi: Helper.EventIdentifier) {
            pre {
                self.achievement == nil: "Ensure achievement is nil"
            }
            self.achievement = achi
        }
    }

    pub struct CommunityDisplay {
        pub let name: String
        pub let description: String
        pub let imageUrl: String
        pub let bannerUrl: String?
        pub let socials: {String: String}

        init(_ ref: &CommunityIns) {
            self.name = ref.name
            self.description = ref.description
            self.imageUrl = "https://nftstorage.link/ipfs/".concat(ref.imageIpfs)
            self.bannerUrl = ref.bannerIpfs != nil ? "https://nftstorage.link/ipfs/".concat(ref.bannerIpfs!) : nil
            self.socials = ref.socials
        }
    }

    pub struct CommuntiyBountyBasics {
        pub let category: Interfaces.BountyType
        pub let key: String
        pub let createdAt: UFix64

        init(
            _ category: Interfaces.BountyType,
            _ key: String,
            _ createdAt: UFix64,
        ) {
            self.category = category
            self.key = key
            self.createdAt = createdAt
        }
    }

    pub resource interface CommunityPublic {
        pub let key: String

        pub fun getID(): UInt64
        pub fun getStandardDisplay(): MetadataViews.Display
        pub fun getDetailedDisplay(): CommunityDisplay

        pub fun getQuestKeys(): [String]
        pub fun getChallengeKeys(): [String]
        pub fun borrowQuestRef(key: String): &QuestConfig?
        pub fun borrowChallengeRef(key: String): &ChallengeConfig?
    }

    pub resource CommunityIns: CommunityPublic, MetadataViews.Resolver {
        pub let key: String
        pub let name: String
        pub var description: String
        pub var imageIpfs: String
        pub var bannerIpfs: String?
        pub let socials: {String: String}
        pub let bounties: [CommuntiyBountyBasics]
        access(contract) let quests: {String: QuestConfig}
        access(contract) let challenges: {String: ChallengeConfig}

        init(
            key: String,
            name: String,
            description: String,
            image: String,
            banner: String?,
            socials: {String: String}?
        ) {
            self.key = key
            self.name = name
            self.description = description
            self.imageIpfs = image
            self.bannerIpfs = banner
            self.socials = socials ?? {}
            self.quests = {}
            self.challenges = {}
            self.bounties = []
        }

        pub fun updateBasics(desc: String, image: String, banner: String?) {
            self.description = desc
            self.imageIpfs = image
            self.bannerIpfs = banner

            emit CommunityUpdateBasics(
                id: self.uuid,
                owner: self.owner!.address,
                name: self.name,
                description: desc,
                image: image,
                banner: banner
            )
        }

        pub fun updateSocial(key: String, value: String) {
            self.socials[key] = value

            emit CommunityUpdateSocial(
                id: self.uuid,
                owner: self.owner!.address,
                key: key,
                value: value
            )
        }

        pub fun addQuest(key: String, quest: QuestConfig) {
            pre {
                self.owner != nil: "Owner exists."
                Community.entityMapping[key] == nil: "Mapping bounty entity exists."
                Community.communityIdMapping[quest.communityId] != nil: "Community mapping doesn't exist."
            }
            let owner = self.owner!.address
            Community.entityMapping[key] = owner
            self.quests[key] = quest
            self.bounties.append(CommuntiyBountyBasics(
                Interfaces.BountyType.quest,
                key,
                getCurrentBlock().timestamp
            ))

            emit QuestCreated(
                key: key,
                communityId: self.uuid,
                owner: owner,
                steps: quest.steps
            )
        }

        pub fun addChallenge(key: String, challenge: ChallengeConfig) {
            pre {
                self.owner != nil: "Owner exists."
                Community.entityMapping[key] == nil: "Mapping bounty entity exists."
                Community.communityIdMapping[challenge.communityId] != nil: "Community mapping doesn't exist."
            }
            let owner = self.owner!.address
            Community.entityMapping[key] = owner
            self.challenges[key] = challenge
            self.bounties.append(CommuntiyBountyBasics(
                Interfaces.BountyType.challenge,
                key,
                getCurrentBlock().timestamp
            ))

            // quest keys
            let questKeys: [String] = []
            for one in challenge.quests {
                assert(Community.entityMapping[one.key] != nil, message: "Failed to find quest:".concat(one.key))
                questKeys.append(one.key)
            }

            emit ChallengeCreated(
                key: key,
                communityId: self.uuid,
                owner: owner,
                questKeys: questKeys,
                achievementHost: challenge.achievement?.host,
                achievementId: challenge.achievement?.eventId,
            )
        }

        pub fun updateChallengeAchievement(key: String, achi: Helper.EventIdentifier) {
            pre {
                self.owner != nil: "Owner exists."
            }

            let challenge = self.challenges[key] ?? panic("Failed to find challenge.")
            challenge.updateAchievement(achi: achi)

            emit ChallengeAchievementUpdated(
                key: key,
                communityId: self.uuid,
                owner: self.owner!.address,
                achievementHost: achi.host,
                achievementId: achi.eventId
            )
        }

        /************* Internals *************/

        access(contract) fun getRef(): &CommunityIns {
            return &self as &CommunityIns
        }

        /************* Getters (for anyone) *************/

        pub fun getID(): UInt64 {
            return self.uuid
        }

        pub fun getQuestKeys(): [String] {
            return self.quests.keys
        }

        pub fun getChallengeKeys(): [String] {
            return self.challenges.keys
        }

        pub fun borrowQuestRef(key: String): &QuestConfig? {
            return &self.quests[key] as &QuestConfig?
        }

        pub fun borrowChallengeRef(key: String): &ChallengeConfig? {
            return &self.challenges[key] as &ChallengeConfig?
        }

        pub fun getStandardDisplay(): MetadataViews.Display {
            return MetadataViews.Display(
                name: self.name,
                description: self.description,
                thumbnail: MetadataViews.HTTPFile(url: "https://nftstorage.link/ipfs/".concat(self.imageIpfs))
            )
        }

        pub fun getDetailedDisplay(): CommunityDisplay {
            return CommunityDisplay(self.getRef())
        }

        // This is for the MetdataStandard
        pub fun getViews(): [Type] {
            let supportedViews = [
                Type<MetadataViews.Display>(),
                Type<CommunityDisplay>()
            ]
            return supportedViews
        }

        // This is for the MetdataStandard
        pub fun resolveView(_ view: Type): AnyStruct? {
            switch view {
                case Type<MetadataViews.Display>():
                    return self.getStandardDisplay()
                case Type<CommunityDisplay>():
                    return self.getDetailedDisplay()
            }
            return nil
        }
    }

    pub resource interface CommunityBuilderPublic {
        pub fun getIDs(): [UInt64]
        pub fun borrowCommunity(id: UInt64): &CommunityIns{CommunityPublic}
        pub fun borrowViewResolver(id: UInt64): &{MetadataViews.Resolver}
    }

    pub resource CommunityBuilder: CommunityBuilderPublic {
        access(contract) var communities: @{UInt64: CommunityIns}

        init() {
            self.communities <- {}
        }
        destroy() {
            destroy self.communities
        }

        pub fun createCommunity(
            key: String,
            name: String,
            description: String,
            image: String,
            banner: String?,
            socials: {String: String}?
        ): UInt64 {
            pre {
                self.owner?.address != nil: "no owner"
                Community.communityKeyMapping[key] == nil: "Unique key is occupied"
            }

            let community <- create CommunityIns(
                key: key,
                name: name,
                description: description,
                image: image,
                banner: banner,
                socials: socials,
            )
            let id = community.uuid
            self.communities[id] <-! community

            let owner = self.owner!.address
            // set to mapping
            Community.communityIdMapping[id] = owner
            Community.communityKeyMapping[key] = id

            emit CommunityCreated(
                id: id,
                key: key,
                owner: owner,
                name: name,
                description: description,
                image: image
            )
            return id
        }

        pub fun borrowCommunityPrivateRef(id: UInt64): &CommunityIns {
            return &self.communities[id] as &CommunityIns? ?? panic("Failed to borrow community.")
        }

        /************* Getters (for anyone) *************/

        pub fun borrowCommunity(id: UInt64): &CommunityIns{CommunityPublic} {
            return &self.communities[id] as &CommunityIns{CommunityPublic}? ?? panic("Failed to borrow community.")
        }

        pub fun getIDs(): [UInt64] {
            return self.communities.keys
        }

        pub fun borrowViewResolver(id: UInt64): &{MetadataViews.Resolver} {
            return &self.communities[id] as &{MetadataViews.Resolver}? ?? panic("Failed to borrow community")
        }
    }

    pub struct CommunityIdentitier {
        pub let owner: Address
        pub let key: String
        pub let id: UInt64

        init(
            _ owner: Address,
            _ key: String,
            _ id: UInt64,
        ) {
            self.owner = owner
            self.key = key
            self.id = id
        }

        pub fun borrowCommunity(): &CommunityIns{CommunityPublic}? {
            return Community.borrowCommunity(host: self.owner, id: self.id)
        }
    }

    // ----- public methods -----

    pub fun createCommunityBuilder(): @CommunityBuilder {
        return <- create CommunityBuilder()
    }

    // Global borrow community

    /**
     * Get all communities
     */
    pub fun getCommunities(): [CommunityIdentitier] {
        let ret: [CommunityIdentitier] = []
        for key in self.communityKeyMapping.keys {
            if let communityId = self.communityKeyMapping[key] {
                if let owner = self.communityIdMapping[communityId] {
                    ret.append(CommunityIdentitier(owner, key, communityId))
                }
            }
        }
        return ret
    }

    pub fun borrowCommunityByKey(key: String): &CommunityIns{CommunityPublic}? {
        if let id = Community.communityKeyMapping[key] {
            return Community.borrowCommunityById(id: id)
        }
        return nil
    }

    pub fun borrowCommunityById(id: UInt64): &CommunityIns{CommunityPublic}? {
        if let host = Community.communityIdMapping[id] {
            return Community.borrowCommunity(host: host, id: id)
        }
        return nil
    }

    pub fun borrowCommunity(host: Address, id: UInt64): &CommunityIns{CommunityPublic}? {
        if let builder = getAccount(host)
            .getCapability<&CommunityBuilder{CommunityBuilderPublic}>(Community.CommunityPublicPath)
            .borrow() {
            return builder.borrowCommunity(id: id)
        }
        return nil
    }

    init() {
        self.CommunityStoragePath = /storage/DevCompetitionCommunityPathV1
        self.CommunityPublicPath = /public/DevCompetitionCommunityPathV1

        self.entityMapping = {}
        self.communityIdMapping = {}
        self.communityKeyMapping = {}

        emit ContractInitialized()
    }
}
