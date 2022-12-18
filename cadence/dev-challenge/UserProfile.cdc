/**
## The contract of user profile

> Author: Bohao Tang<tech@btang.cn>

*/
import Interfaces from "./Interfaces.cdc"

pub contract UserProfile {

    /**    ___  ____ ___ _  _ ____
       *   |__] |__|  |  |__| [__
        *  |    |  |  |  |  | ___]
         *************************/

    pub let ProfileStoragePath: StoragePath;
    pub let ProfilePublicPath: PublicPath;

    /**    ____ _  _ ____ _  _ ___ ____
       *   |___ |  | |___ |\ |  |  [__
        *  |___  \/  |___ | \|  |  ___]
         ******************************/
    pub event ContractInitialized()
    pub event ProfileCreated(profileId: UInt64)
    pub event ProfileUpsertIdentity(profile: Address, platform: String, uid: String, name: String, image: String)

    pub event ProfileSeasonAddPoints(profile: Address, seasonId: UInt64, points: UInt64)
    pub event ProfileSeasonNewSeason(profile: Address, seasonId: UInt64, referredFrom: Address?)
    pub event ProfileSeasonBountyCompleted(profile: Address, seasonId: UInt64, bountyId: UInt64)
    pub event QuestRecordUpdateParams(profile: Address, seasonId: UInt64, questKey: String, step: Int, keys: [String], round: UInt64)
    pub event QuestRecordUpdateResult(profile: Address, seasonId: UInt64, questKey: String, step: Int, result: Bool, round: UInt64)
    pub event ProfileSetupReferralCode(profile: Address, seasonId: UInt64, code: String)

    /**    ____ ___ ____ ___ ____
       *   [__   |  |__|  |  |___
        *  ___]  |  |  |  |  |___
         ************************/

    pub var totalProfiles: UInt64
    access(contract) let platformMapping: {String: Address}

    /**    ____ _  _ _  _ ____ ___ _ ____ _  _ ____ _    _ ___ _   _
       *   |___ |  | |\ | |     |  | |  | |\ | |__| |    |  |   \_/
        *  |    |__| | \| |___  |  | |__| | \| |  | |___ |  |    |
         ***********************************************************/

    pub struct VerificationStep {
        pub let params: [{String: AnyStruct}]
        pub let results: {Int: Bool}

        init() {
            self.params = []
            self.results = {}
        }

        access(contract) fun updateParams(idx: Int, params: {String: AnyStruct}) {
            pre {
                idx <= self.params.length: "Out of bound"
            }
            if idx == self.params.length {
                self.params.append(params)
            } else {
                self.params[idx] = params
            }
        }

        access(contract) fun updateResult(idx: Int, result: Bool) {
            pre {
                idx <= self.params.length: "Out of bound"
                self.results[idx] == nil: "Verification result exists"
            }
            self.results[idx] = result
        }

        pub fun isValid(): Bool {
            var valid: Bool = false
            for key in self.results.keys {
                valid = valid || self.results[key]!
                if valid {
                    break
                }
            }
            return valid
        }
    }

    /**
    Profile quest record
     */
    pub struct QuestRecord {
        pub let steps: [VerificationStep]
        pub var timesCompleted: UInt64

        init(_ stepAmt: Int) {
            self.timesCompleted = 0
            self.steps = []

            var i = 0
            while i < stepAmt {
                self.steps.append(VerificationStep())
                i = i + 1
            }
        }

        pub fun getLatestIndex(): Int {
            return Int(self.timesCompleted)
        }

        access(contract) fun updateVerifactionParams(step: Int, params: {String: AnyStruct}) {
            self.steps[step].updateParams(idx: self.getLatestIndex(), params: params)
        }

        // latest result and times completed
        access(contract) fun updateVerificationResult(step: Int, result: Bool) {
            self.steps[step].updateResult(idx: self.getLatestIndex(), result: result)
            // update completed one time
            if step == self.steps.length - 1 && result {
                self.timesCompleted = self.timesCompleted + 1
            }
        }
    }

    pub struct SeasonRecord {
        pub let seasonId: UInt64
        pub let referredFromAddress: Address?
        pub var referralCode: String?
        pub var points: UInt64

        access(self) let campetitionServiceCap: Capability<&{Interfaces.CompetitionServicePublic}>
        access(contract) var questScores: {String: QuestRecord}
        access(contract) var bountiesCompleted: {UInt64: UFix64}

        init(
            seasonId: UInt64,
            cap: Capability<&{Interfaces.CompetitionServicePublic}>,
            referredFrom: Address?
        ) {
            self.seasonId = seasonId
            self.campetitionServiceCap = cap
            self.referredFromAddress = referredFrom
            self.referralCode = nil
            self.points = 0
            self.questScores = {}
            self.bountiesCompleted = {}
        }

        // get a copy of bountiesCompleted
        pub fun getBountiesCompleted(): {UInt64: UFix64} {
            return self.bountiesCompleted
        }

        pub fun getQuestStatus(questKey: String): Interfaces.QuestStatus {
            let score = self.getQuestScore(questKey: questKey)
            let steps: [Bool] = []
            for step in score.steps {
                steps.append(step.isValid())
            }
            return Interfaces.QuestStatus(steps: steps)
        }

        pub fun isBountyCompleted(bountyId: UInt64): Bool {
            return self.bountiesCompleted[bountyId] != nil
        }

        // get quest score keys
        pub fun getQuestKeys(): [String] {
            return self.questScores.keys
        }

        // get a copy of quest score
        pub fun getQuestScore(questKey: String): QuestRecord {
            return self.questScores[questKey] ?? panic("Missing quest record")
        }

        // get reference of the quest record
        access(contract) fun fetchOrCreateQuestRecordRef(questKey: String): &QuestRecord {
            var record = &self.questScores[questKey] as &QuestRecord?
            if record == nil {
                let serviceRef = self.campetitionServiceCap.borrow() ?? panic("Failed to get service capability.")
                let competitionRef = serviceRef.borrowSeason(seasonId: self.seasonId)
                assert(competitionRef.isActive(), message: "Competition is not active.")

                let questInfo = competitionRef.borrowQuestRef(questKey)
                let questDetail = questInfo.getDetail()
                self.questScores[questKey] = QuestRecord(Int(questDetail.steps))
                record = &self.questScores[questKey] as &QuestRecord?
            }
            return record!
        }

        // update verification result
        access(contract) fun addPoints(points: UInt64) {
            self.points = self.points + points
        }

        // set the referral code
        access(contract) fun setupReferralCode(code: String) {
            pre {
                self.referralCode == nil: "referral code should be nil"
            }
            self.referralCode = code
        }

        access(contract) fun completeBounty(bountyId: UInt64, owner: Address) {
            let serviceRef = self.campetitionServiceCap.borrow() ?? panic("Failed to get service capability.")
            let competitionRef = serviceRef.borrowSeason(seasonId: self.seasonId)
            assert(competitionRef.isActive(), message: "Competition is not active.")

            let bountyInfo = competitionRef.borrowBountyInfo(bountyId)
            let requiredQuests = bountyInfo.getRequiredQuestKeys()
            var invalid = false
            for key in requiredQuests {
                let recordRef = self.fetchOrCreateQuestRecordRef(questKey: key)
                if recordRef.timesCompleted == 0 {
                    invalid = true
                    break
                }
            }
            assert(!invalid, message: "required quests are not completed.")
            // set bounties as completed
            self.bountiesCompleted[bountyId] = getCurrentBlock().timestamp

            // callback to service
            competitionRef.onBountyCompleted(bountyId: bountyId, acct: owner)
        }
    }

    // Profile writable
    pub resource interface ProfilePrivate {
        pub fun registerForNewSeason(
            serviceCap: Capability<&{Interfaces.CompetitionServicePublic}>,
            referredFrom: Address?
        )
        pub fun upsertIdentity(platform: String, identity: Interfaces.LinkedIdentity)
    }

    pub resource Profile: Interfaces.ProfilePublic, ProfilePrivate {
        access(self) var seasonScores: {UInt64: SeasonRecord}
        access(self) var linkedIdentities: {String: Interfaces.LinkedIdentity}

        init() {
            self.seasonScores = {}
            self.linkedIdentities = {}

            UserProfile.totalProfiles = UserProfile.totalProfiles + 1

            emit ProfileCreated(profileId: self.uuid)
        }

        // ---- readonly methods ----

        pub fun getId(): UInt64 {
            return self.uuid
        }

        pub fun getIdentities(): [Interfaces.LinkedIdentity] {
            return self.linkedIdentities.values
        }

        pub fun getIdentity(platform: String): Interfaces.LinkedIdentity {
            return self.linkedIdentities[platform] ?? panic("Platform not found.")
        }

        pub fun isRegistered(seasonId: UInt64): Bool {
            return self.seasonScores[seasonId] != nil
        }

        pub fun getSeasonPoints(seasonId: UInt64): UInt64 {
            let seasonRef = self.borrowSeasonRecordRef(seasonId)
            return seasonRef.points
        }

        pub fun getReferredFrom(seasonId: UInt64): Address? {
            let seasonRef = self.borrowSeasonRecordRef(seasonId)
            return seasonRef.referredFromAddress
        }

        pub fun getReferralCode(seasonId: UInt64): String? {
            let seasonRef = self.borrowSeasonRecordRef(seasonId)
            return seasonRef.referralCode
        }

        pub fun getQuestStatus(seasonId: UInt64, questKey: String): Interfaces.QuestStatus {
            let seasonRef = self.borrowSeasonRecordRef(seasonId)
            return seasonRef.getQuestStatus(questKey: questKey)
        }

        pub fun getBountiesCompleted(seasonId: UInt64): {UInt64: UFix64} {
            let seasonRef = self.borrowSeasonRecordRef(seasonId)
            return seasonRef.getBountiesCompleted()
        }

        pub fun isBountyCompleted(seasonId: UInt64, bountyId: UInt64): Bool {
            let seasonRef = self.borrowSeasonRecordRef(seasonId)
            return seasonRef.isBountyCompleted(bountyId: bountyId)
        }

        pub fun getQuestsParticipanted(seasonId: UInt64): [String] {
            let seasonRef = self.borrowSeasonRecordRef(seasonId)
            return seasonRef.getQuestKeys()
        }

        // ---- writable methods ----

        pub fun registerForNewSeason(
            serviceCap: Capability<&{Interfaces.CompetitionServicePublic}>,
            referredFrom: Address?
        ) {
            let profileAddr = self.owner?.address ?? panic("Owner not exist")

            let serviceRef = serviceCap.borrow() ?? panic("Failed to get service capability.")
            let competitionRef = serviceRef.borrowLatestActiveSeason()
            assert(competitionRef.isActive(), message: "Competition is not active.")

            // ensure referred from others
            assert(referredFrom == nil || referredFrom! != profileAddr, message: "Invalid referral from")

            // add to competition
            competitionRef.onProfileRegistered(acct: profileAddr)

            let seasonId = competitionRef.getSeasonId()
            assert(self.seasonScores[seasonId] == nil, message: "Already registered.")
            self.seasonScores[seasonId] = SeasonRecord(
                seasonId: seasonId,
                cap: serviceCap,
                referredFrom: referredFrom
            )

            emit ProfileSeasonNewSeason(
                profile: profileAddr,
                seasonId: seasonId,
                referredFrom: referredFrom,
            )
        }

        pub fun upsertIdentity(platform: String, identity: Interfaces.LinkedIdentity) {
            let profileAddr = self.owner?.address ?? panic("Owner not exist")
            let uid = platform.concat("#").concat(identity.uid)
            assert(UserProfile.platformMapping[uid] == nil, message: "The UID registered.")

            UserProfile.platformMapping[uid] = profileAddr
            self.linkedIdentities[platform] = identity

            emit ProfileUpsertIdentity(
                profile: profileAddr,
                platform: platform,
                uid: identity.uid,
                name: identity.display.name,
                image: identity.display.thumbnail.uri()
            )
        }

        access(account) fun addPoints(seasonId: UInt64, points: UInt64) {
            let profileAddr = self.owner?.address ?? panic("Owner not exist")

            let seasonRef = self.borrowSeasonRecordRef(seasonId)
            seasonRef.addPoints(points: points)

            emit ProfileSeasonAddPoints(
                profile: profileAddr,
                seasonId: seasonId,
                points: points,
            )
        }

        access(account) fun updateQuestNewParams(seasonId: UInt64, questKey: String, step: Int, params: {String: AnyStruct}) {
            let profileAddr = self.owner?.address ?? panic("Owner not exist")

            let seasonRef = self.borrowSeasonRecordRef(seasonId)
            let questScoreRef = seasonRef.fetchOrCreateQuestRecordRef(questKey: questKey)
            questScoreRef.updateVerifactionParams(step: step, params: params)

            emit QuestRecordUpdateParams(
                profile: profileAddr,
                seasonId: seasonId,
                questKey: questKey,
                step: step,
                keys: params.keys,
                round: questScoreRef.timesCompleted
            )
        }

        // latest result and times completed
        access(account) fun updateQuestVerificationResult(seasonId: UInt64, questKey: String, step: Int, result: Bool) {
            let profileAddr = self.owner?.address ?? panic("Owner not exist")

            let seasonRef = self.borrowSeasonRecordRef(seasonId)
            let questScoreRef = seasonRef.fetchOrCreateQuestRecordRef(questKey: questKey)
            questScoreRef.updateVerificationResult(step: step, result: result)

            emit QuestRecordUpdateResult(
                profile: profileAddr,
                seasonId: seasonId,
                questKey: questKey,
                step: step,
                result: result,
                round: questScoreRef.timesCompleted
            )
        }

        access(account) fun completeBounty(seasonId: UInt64, bountyId: UInt64) {
            let profileAddr = self.owner?.address ?? panic("Owner not exist")

            let seasonRef = self.borrowSeasonRecordRef(seasonId)
            seasonRef.completeBounty(bountyId: bountyId, owner: profileAddr)

            emit ProfileSeasonBountyCompleted(
                profile: profileAddr,
                seasonId: seasonId,
                bountyId: bountyId,
            )
        }

        access(account) fun setupReferralCode(seasonId: UInt64, code: String) {
            let profileAddr = self.owner?.address ?? panic("Owner not exist")

            let seasonRef = self.borrowSeasonRecordRef(seasonId)
            seasonRef.setupReferralCode(code: code)

            emit ProfileSetupReferralCode(
                profile: profileAddr,
                seasonId: seasonId,
                code: code,
            )
        }

        // ---- internal methods ----

        access(self) fun borrowSeasonRecordRef(_ seasonId: UInt64): &SeasonRecord {
            return &self.seasonScores[seasonId] as &SeasonRecord? ?? panic("Missing season score")
        }
    }

    // ---- public methods ----

    pub fun createUserProfile(): @Profile {
        return <- create Profile()
    }

    pub fun borrowUserProfilePublic(_ acct: Address): &Profile{Interfaces.ProfilePublic} {
        return getAccount(acct)
            .getCapability<&Profile{Interfaces.ProfilePublic}>(UserProfile.ProfilePublicPath)
            .borrow() ?? panic("Failed to borrow user profile: ".concat(acct.toString()))
    }

    init() {
        self.totalProfiles = 0
        self.platformMapping = {}

        self.ProfileStoragePath = /storage/DevCompetitionProfilePathV2
        self.ProfilePublicPath = /public/DevCompetitionProfilePathV2

        emit ContractInitialized()
    }
}
