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
    pub event MissionRecordUpdateParams(profile: Address, seasonId: UInt64, missionKey: String, step: Int, keys: [String], round: UInt64)
    pub event MissionRecordUpdateResult(profile: Address, seasonId: UInt64, missionKey: String, step: Int, result: Bool, round: UInt64)
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
    Profile mission record
     */
    pub struct MissionRecord {
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
        access(contract) var missionScores: {String: MissionRecord}
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
            self.missionScores = {}
            self.bountiesCompleted = {}
        }

        // get a copy of bountiesCompleted
        pub fun getBountiesCompleted(): {UInt64: UFix64} {
            return self.bountiesCompleted
        }

        pub fun getMissionStatus(missionKey: String): Interfaces.MissionStatus {
            let score = self.getMissionScore(missionKey: missionKey)
            let steps: [Bool] = []
            for step in score.steps {
                steps.append(step.isValid())
            }
            return Interfaces.MissionStatus(steps: steps)
        }

        pub fun isBountyCompleted(bountyId: UInt64): Bool {
            return self.bountiesCompleted[bountyId] != nil
        }

        // get mission score keys
        pub fun getMissionKeys(): [String] {
            return self.missionScores.keys
        }

        // get a copy of mission score
        pub fun getMissionScore(missionKey: String): MissionRecord {
            return self.missionScores[missionKey] ?? panic("Missing mission record")
        }

        // get reference of the mission record
        access(contract) fun fetchOrCreateMissionRecordRef(missionKey: String): &MissionRecord {
            var record = &self.missionScores[missionKey] as &MissionRecord?
            if record == nil {
                let serviceRef = self.campetitionServiceCap.borrow() ?? panic("Failed to get service capability.")
                let competitionRef = serviceRef.borrowSeason(seasonId: self.seasonId)
                assert(competitionRef.isActive(), message: "Competition is not active.")

                let info = competitionRef.borrowMissionRef(missionKey)
                let missionDetail = info.getDetail()
                self.missionScores[missionKey] = MissionRecord(Int(missionDetail.steps))
                record = &self.missionScores[missionKey] as &MissionRecord?
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
            let requiredMissions = bountyInfo.getRequiredMissionKeys()
            var invalid = false
            for key in requiredMissions {
                let recordRef = self.fetchOrCreateMissionRecordRef(missionKey: key)
                if recordRef.timesCompleted == 0 {
                    invalid = true
                    break
                }
            }
            assert(!invalid, message: "required missions are not completed.")
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

        pub fun getMissionStatus(seasonId: UInt64, missionKey: String): Interfaces.MissionStatus {
            let seasonRef = self.borrowSeasonRecordRef(seasonId)
            return seasonRef.getMissionStatus(missionKey: missionKey)
        }

        pub fun getBountiesCompleted(seasonId: UInt64): {UInt64: UFix64} {
            let seasonRef = self.borrowSeasonRecordRef(seasonId)
            return seasonRef.getBountiesCompleted()
        }

        pub fun isBountyCompleted(seasonId: UInt64, bountyId: UInt64): Bool {
            let seasonRef = self.borrowSeasonRecordRef(seasonId)
            return seasonRef.isBountyCompleted(bountyId: bountyId)
        }

        pub fun getMissionsParticipanted(seasonId: UInt64): [String] {
            let seasonRef = self.borrowSeasonRecordRef(seasonId)
            return seasonRef.getMissionKeys()
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

            assert(
                UserProfile.platformMapping[uid] == nil || UserProfile.platformMapping[uid] == profileAddr,
                message: "Platfrom UID registered"
            )
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

        access(account) fun updateMissionNewParams(seasonId: UInt64, missionKey: String, step: Int, params: {String: AnyStruct}) {
            let profileAddr = self.owner?.address ?? panic("Owner not exist")

            let seasonRef = self.borrowSeasonRecordRef(seasonId)
            let missionScoreRef = seasonRef.fetchOrCreateMissionRecordRef(missionKey: missionKey)
            missionScoreRef.updateVerifactionParams(step: step, params: params)

            emit MissionRecordUpdateParams(
                profile: profileAddr,
                seasonId: seasonId,
                missionKey: missionKey,
                step: step,
                keys: params.keys,
                round: missionScoreRef.timesCompleted
            )
        }

        // latest result and times completed
        access(account) fun updateMissionVerificationResult(seasonId: UInt64, missionKey: String, step: Int, result: Bool) {
            let profileAddr = self.owner?.address ?? panic("Owner not exist")

            let seasonRef = self.borrowSeasonRecordRef(seasonId)
            let missionScoreRef = seasonRef.fetchOrCreateMissionRecordRef(missionKey: missionKey)
            missionScoreRef.updateVerificationResult(step: step, result: result)

            emit MissionRecordUpdateResult(
                profile: profileAddr,
                seasonId: seasonId,
                missionKey: missionKey,
                step: step,
                result: result,
                round: missionScoreRef.timesCompleted
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

    pub fun getPlatformLinkedAddress(platform: String, uid: String): Address? {
        let uid = platform.concat("#").concat(uid)
        return UserProfile.platformMapping[uid]
    }

    init() {
        self.totalProfiles = 0
        self.platformMapping = {}

        self.ProfileStoragePath = /storage/DevCompetitionProfilePathV5
        self.ProfilePublicPath = /public/DevCompetitionProfilePathV5

        emit ContractInitialized()
    }
}
