/**
## The contract of bounty unlock condition

> Author: Bohao Tang<tech@btang.cn>
*/
import FLOAT from "../deps/FLOAT.cdc"
import Interfaces from "./Interfaces.cdc"
import UserProfile from "./UserProfile.cdc"

pub contract BountyUnlockConditions {

    pub enum UnlockConditionTypes: UInt8 {
        pub case MinimumPoint
        pub case FLOATRequired
        pub case CompletedBountyAmount
    }

    pub struct MinimumPointRequired: Interfaces.UnlockCondition {
        pub let type: UInt8;
        pub let seasonId: UInt64
        pub let amount: UInt64

        init(
            seasonId: UInt64,
            amount: UInt64
        ) {
            self.type = UnlockConditionTypes.MinimumPoint.rawValue
            self.seasonId = seasonId
            self.amount = amount
        }

        pub fun isUnlocked(_ params: {String: AnyStruct}): Bool {
            let profileAddr: Address = params["profile"]! as! Address
            if let profile = getAccount(profileAddr)
                .getCapability(UserProfile.ProfilePublicPath)
                .borrow<&UserProfile.Profile{Interfaces.ProfilePublic}>() {
                let points = profile.getSeasonPoints(seasonId: self.seasonId)
                return points >= self.amount
            } else {
                return false
            }
        }
    }

    pub struct FLOATRequired: Interfaces.UnlockCondition {
        pub let type: UInt8;
        pub let host: Address;
        pub let eventId: UInt64

        init(
            host: Address,
            eventId: UInt64,
        ) {
            self.type = UnlockConditionTypes.FLOATRequired.rawValue
            self.host = host
            self.eventId = eventId
        }

        pub fun isUnlocked(_ params: {String: AnyStruct}): Bool {
            let profileAddr: Address = params["profile"]! as! Address
            if let collection = getAccount(profileAddr)
                .getCapability(FLOAT.FLOATCollectionPublicPath)
                .borrow<&FLOAT.Collection{FLOAT.CollectionPublic}>() {
                let len = collection.ownedIdsFromEvent(eventId: self.eventId).length
                return len > 0
            } else {
                return false
            }
        }
    }

    pub struct CompletedBountyAmount: Interfaces.UnlockCondition {
        pub let type: UInt8;
        pub let seasonId: UInt64
        pub let amount: UInt64

        init(
            seasonId: UInt64,
            amount: UInt64
        ) {
            self.type = UnlockConditionTypes.CompletedBountyAmount.rawValue
            self.seasonId = seasonId
            self.amount = amount
        }

        pub fun isUnlocked(_ params: {String: AnyStruct}): Bool {
            let profileAddr: Address = params["profile"]! as! Address
            if let profile = getAccount(profileAddr)
                .getCapability(UserProfile.ProfilePublicPath)
                .borrow<&UserProfile.Profile{Interfaces.ProfilePublic}>() {
                let completed = profile.getBountiesCompleted(seasonId: self.seasonId)
                return UInt64(completed.keys.length) >= self.amount
            } else {
                return false
            }
        }
    }
}
