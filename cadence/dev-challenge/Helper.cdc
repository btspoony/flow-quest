import FLOAT from "../deps/FLOAT.cdc"

pub contract Helper {

    // -------- FLOAT Event Helper --------

    // identifier of an Event
    pub struct EventIdentifier {
        // event owner address
        pub let host: Address
        // event id
        pub let eventId: UInt64

        init(_ address: Address, _ eventId: UInt64) {
            self.host = address
            self.eventId = eventId
        }

        // get the reference of the given event
        pub fun getEventPublic(): &FLOAT.FLOATEvent{FLOAT.FLOATEventPublic} {
            let ownerEvents = getAccount(self.host)
                .getCapability(FLOAT.FLOATEventsPublicPath)
                .borrow<&FLOAT.FLOATEvents{FLOAT.FLOATEventsPublic}>()
                ?? panic("Could not borrow the public FLOATEvents.")
            return ownerEvents.borrowPublicEventRef(eventId: self.eventId)
                ?? panic("Failed to get event reference.")
        }

        // convert identifier to string
        pub fun toString(): String {
            return self.host.toString().concat("#").concat(self.eventId.toString())
        }
    }

    // -------- Quest Rewards --------

    pub enum QuestRewardType: UInt8 {
        pub case Points
        pub case FLOAT
    }

    pub struct interface RewardInfo {
        pub let type: QuestRewardType
    }

    pub struct PointReward: RewardInfo {
        pub let type: QuestRewardType
        pub let rewardPoints: UInt64
        pub let referralPoints: UInt64

        init(
            _ points: UInt64,
            _ referralPoints: UInt64?
        ) {
            self.type = QuestRewardType.Points
            self.rewardPoints = points
            self.referralPoints = referralPoints ?? 0
        }
    }

    pub struct FLOATReward: RewardInfo {
        pub let type: QuestRewardType
        pub let eventIdentifier: EventIdentifier

        init(
            _ identifier: EventIdentifier
        ) {
            self.type = QuestRewardType.FLOAT
            self.eventIdentifier = identifier
        }
    }
}
