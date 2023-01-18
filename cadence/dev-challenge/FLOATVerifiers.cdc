import FLOAT from "../deps/FLOAT.cdc"
import Interfaces from "./Interfaces.cdc"
import UserProfile from "./UserProfile.cdc"
import CompetitionService from "./CompetitionService.cdc"

pub contract FLOATVerifiers {

    pub struct EnsureFLOATExists: FLOAT.IVerifier {
        pub let eventId: UInt64

        pub fun verify(_ params: {String: AnyStruct}) {
            let claimee: Address = params["claimee"]! as! Address
            if let collection = getAccount(claimee)
                .getCapability(FLOAT.FLOATCollectionPublicPath)
                .borrow<&FLOAT.Collection{FLOAT.CollectionPublic}>() {
                let len = collection.ownedIdsFromEvent(eventId: self.eventId).length
                assert(
                    len > 0,
                    message: "You haven't the required FLOAT: #".concat(self.eventId.toString())
                )
            } else {
                panic("You do not have FLOAT Collection")
            }
        }

        init(eventId: UInt64) {
            self.eventId = eventId
        }
    }

    pub struct BountyCompleted: FLOAT.IVerifier {
        pub let seasonId: UInt64
        pub let bountyId: UInt64

        pub fun verify(_ params: {String: AnyStruct}) {
            let claimee: Address = params["claimee"]! as! Address
            if let profile = getAccount(claimee)
                .getCapability(UserProfile.ProfilePublicPath)
                .borrow<&UserProfile.Profile{Interfaces.ProfilePublic}>() {
                let isCompleted = profile.isBountyCompleted(seasonId: self.seasonId, bountyId: self.bountyId)
                assert(
                    isCompleted,
                    message: "You didn't finish the bounty #:".concat(self.bountyId.toString())
                )
            } else {
                panic("You do not have Profile resource")
            }
        }

        init(seasonId: UInt64, bountyId: UInt64) {
            self.seasonId = seasonId
            self.bountyId = bountyId
        }
    }

    pub struct QuestCompletedInActiveSeason: FLOAT.IVerifier {
        pub let questKey: String

        pub fun verify(_ params: {String: AnyStruct}) {
            let claimee: Address = params["claimee"]! as! Address

            if let profile = getAccount(claimee)
                .getCapability(UserProfile.ProfilePublicPath)
                .borrow<&UserProfile.Profile{Interfaces.ProfilePublic}>() {
                let service = CompetitionService.borrowServicePublic()
                let seasonId = service.getActiveSeasonID()
                let questStatus = profile.getQuestStatus(seasonId: seasonId, questKey: self.questKey)
                assert(
                    questStatus.completed,
                    message: "You didn't complete the quest #:".concat(self.questKey)
                )
            } else {
                panic("You do not have Profile resource")
            }
        }

        init(questKey: String) {
            self.questKey = questKey
        }
    }
}
