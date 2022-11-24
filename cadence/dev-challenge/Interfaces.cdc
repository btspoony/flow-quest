import MetadataViews from "../deps/MetadataViews.cdc"

pub contract Interfaces {

    pub struct LinkedIdentity {
        pub let platform: String
        pub let uid: String
        pub let display: MetadataViews.Display

        init(platform: String, uid: String, display: MetadataViews.Display) {
            self.platform = platform
            self.uid = uid
            self.display = display
        }
    }

    // Profile readable
    pub resource interface ProfilePublic {
        pub fun getId(): UInt64

        pub fun getIdentities(): [LinkedIdentity]
        pub fun getIdentity(platform: String): LinkedIdentity

        pub fun getSeasonPoints(seasonId: UInt64): UInt64
        pub fun getReferredFrom(seasonId: UInt64): Address?

        // readable
        pub fun getTimesCompleted(seasonId: UInt64, questKey: String): UInt64
        pub fun getLatestSeasonQuestParameters(seasonId: UInt64, questKey: String): {String: AnyStruct}
        pub fun getLatestSeasonQuestIndex(seasonId: UInt64, questKey: String): Int
        pub fun getLatestSeasonQuestResult(seasonId: UInt64, questKey: String): Bool?

        // writable
        access(account) fun addPoints(seasonId: UInt64, points: UInt64)
        access(account) fun appendNewParams(seasonId: UInt64, questKey: String, params: {String: AnyStruct})
        access(account) fun updateVerificationResult(seasonId: UInt64, questKey: String, idx: Int, result: Bool)

        access(account) fun setupReferralCode(seasonId: UInt64)
    }

    // Competition public interface
    pub resource interface CompetitionPublic {
        pub fun getId(): UInt64
        pub fun isActive(): Bool

        access(account) fun registerProfile(acct: Address)
    }

    pub resource interface CompetitionServicePublic {
        pub fun getLatestActiveSeason(): &{CompetitionPublic}
    }
}
