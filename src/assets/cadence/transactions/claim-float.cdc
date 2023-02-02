import FLOAT from "../../../../cadence/deps/FLOAT.cdc"
import NonFungibleToken from "../../../../cadence/deps/NonFungibleToken.cdc"
import MetadataViews from "../../../../cadence/deps/MetadataViews.cdc"
import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
// import Community from "../../../../cadence/dev-challenge/Community.cdc"
import Helper from "../../../../cadence/dev-challenge/Helper.cdc"
import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

transaction(bountyId: UInt64) {
  let FLOATEvent: &FLOAT.FLOATEvent{FLOAT.FLOATEventPublic}
  let Collection: &FLOAT.Collection

  prepare(acct: AuthAccount) {
    // SETUP COLLECTION
    if acct.borrow<&FLOAT.Collection>(from: FLOAT.FLOATCollectionStoragePath) == nil {
        acct.save(<- FLOAT.createEmptyCollection(), to: FLOAT.FLOATCollectionStoragePath)
        acct.link<&FLOAT.Collection{NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection, FLOAT.CollectionPublic}>
                (FLOAT.FLOATCollectionPublicPath, target: FLOAT.FLOATCollectionStoragePath)
    }

    self.Collection = acct.borrow<&FLOAT.Collection>(from: FLOAT.FLOATCollectionStoragePath)
                        ?? panic("Could not get the Collection from the signer.")

    var floatHost: Address? = nil
    var floatId: UInt64? = nil
    let service = CompetitionService.borrowServicePublic()
    let bountyRef = service.borrowBountyDetail(bountyId)
    if bountyRef.getRewardType() == Helper.MissionRewardType.FLOAT {
        let reward = bountyRef.getFLOATReward().eventIdentifier
        floatHost = reward.host
        floatId = reward.eventId
    } else {
        let identifier = bountyRef.getBountyIdentifier()
        if identifier.category == Interfaces.BountyType.quest {
            if let reward = identifier.getQuestConfig().achievement {
                floatHost = reward.host
                floatId = reward.eventId
            }
        }
    }
    assert(floatHost != nil && floatId != nil, message: "No FLOAT reward in the bounty:".concat(bountyId.toString()))

    let FLOATEvents = getAccount(floatHost!).getCapability(FLOAT.FLOATEventsPublicPath)
                        .borrow<&FLOAT.FLOATEvents{FLOAT.FLOATEventsPublic}>()
                        ?? panic("Could not borrow the public FLOATEvents from the host.")
    self.FLOATEvent = FLOATEvents.borrowPublicEventRef(eventId: floatId!) ?? panic("This event does not exist.")
  }

  execute {
    let params: {String: AnyStruct} = {}

    self.FLOATEvent.claim(recipient: self.Collection, params: params)
    log("Claimed the FLOAT.")
  }
}
