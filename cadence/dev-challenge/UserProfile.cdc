/**
## The contract of user profile

> Author: Bohao Tang<tech@btang.cn>

*/
import MetadataViews from "../deps/MetadataViews.cdc"

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

    /**    ____ ___ ____ ___ ____
       *   [__   |  |__|  |  |___
        *  ___]  |  |  |  |  |___
         ************************/

    // TODO

    /**    ____ _  _ _  _ ____ ___ _ ____ _  _ ____ _    _ ___ _   _
       *   |___ |  | |\ | |     |  | |  | |\ | |__| |    |  |   \_/
        *  |    |__| | \| |___  |  | |__| | \| |  | |___ |  |    |
         ***********************************************************/

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

    pub struct QuestRecord {
        pub var timesCompleted: UInt64
        pub var verificationParams: [{String: AnyStruct}]
        pub var verificationResults: [Bool]

        init() {
            self.timesCompleted = 0
            self.verificationParams = []
            self.verificationResults = []
        }

        pub fun getLatestParams(): {String: AnyStruct} {
            return self.verificationParams[self.verificationParams.length - 1]
        }

        access(contract) fun appendNewParams(params: {String: AnyStruct}) {
            self.verificationParams.append(params)
        }

        // TODO: update latest result and times completed
    }

    pub struct SeasonRecord {
        pub let referredFromCode: String?
        pub let referredFromAddress: Address?
        pub var referralCode: String?
        pub var points: UInt64
        access(contract) var questScores: {String: QuestRecord}

        init(_ referredFrom: String?) {
            self.referredFromCode = referredFrom
            self.referredFromAddress = nil // TODO: parse address?
            self.referralCode = nil
            self.points = 0
            self.questScores = {}
        }

        access(contract) fun generateReferralCode() {
            // TODO
        }

        access(contract) fun getQuestRecordRef(questKey: String): &QuestRecord {
            return &self.questScores[questKey] as &QuestRecord? ?? panic("Missing quest record refs.")
        }
    }

    pub resource interface ProfilePublic {
        pub fun getSeasonPoints(seasonId: UInt64): UInt64

        access(account) fun getLatestSeasonQuestParameters(seasonId: UInt64, questKey: String): {String: AnyStruct}
    }

    pub resource Profile: ProfilePublic {
        access(self) var seasonScores: {UInt64: SeasonRecord}
        access(self) var linkedIdentities: {String: LinkedIdentity}

        init() {
            self.seasonScores = {}
            self.linkedIdentities = {}
        }

        // ---- factory methods ----


        // ---- readonly methods ----

        pub fun getSeasonPoints(seasonId: UInt64): UInt64 {
            let seasonRef = self.getSeasonRecordRef(seasonId)
            return seasonRef.points
        }

        access(account) fun getLatestSeasonQuestParameters(seasonId: UInt64, questKey: String): {String: AnyStruct} {
            let seasonRef = self.getSeasonRecordRef(seasonId)
            let questScoreRef = seasonRef.getQuestRecordRef(questKey: questKey)
            return questScoreRef.getLatestParams()
        }

        access(contract) fun getSeasonRecordRef(_ seasonId: UInt64): &SeasonRecord {
            return &self.seasonScores[seasonId] as &SeasonRecord? ?? panic("Missing season score")
        }

        // ---- writable methods ----

    }


    // ---- public methods ----

    pub fun createUserProfile(): @Profile {
        return <- create Profile()
    }

    init() {
        self.ProfileStoragePath = /storage/DevCompetitionProfilePathV1
        self.ProfilePublicPath = /public/DevCompetitionProfilePathV1

        emit ContractInitialized()
    }
}
