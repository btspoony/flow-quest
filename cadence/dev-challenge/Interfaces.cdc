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
        pub fun getQuestCompletedTimes(seasonId: UInt64, questKey: String): UInt64
        pub fun getBountiesCompleted(seasonId: UInt64): {UInt64: UFix64}

        // writable
        access(account) fun addPoints(seasonId: UInt64, points: UInt64)
        access(account) fun updateQuestNewParams(seasonId: UInt64, questKey: String, step: Int, params: {String: AnyStruct})
        access(account) fun updateQuestVerificationResult(seasonId: UInt64, questKey: String, step: Int, result: Bool)
        access(account) fun completeBounty(seasonId: UInt64, bountyUid: UInt64)

        access(account) fun setupReferralCode(seasonId: UInt64)
    }

    // Bounty information
    pub resource interface BountyInfoPublic {
        pub let endDate: UFix64;
        // TODO: more info required

        pub fun getRequiredQuestKeys(): [String]
    }

    // Competition public interface
    pub resource interface CompetitionPublic {
        pub fun getId(): UInt64
        pub fun isActive(): Bool

        pub fun getBountyInfo(_ bountyUid: UInt64): &{BountyInfoPublic}

        access(account) fun onProfileRegistered(acct: Address)
        access(account) fun onBountyCompleted(bountyUid: UInt64, acct: Address)
    }

    pub resource interface CompetitionServicePublic {
        pub fun getSeason(seasonId: UInt64): &{CompetitionPublic}
        pub fun getLatestActiveSeason(): &{CompetitionPublic}
    }
}
