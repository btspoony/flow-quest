// import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
// import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
// import Community from "../../../../cadence/dev-challenge/Community.cdc"
// import Helper from "../../../../cadence/dev-challenge/Helper.cdc"
import FLOAT from "../../../../cadence/deps/FLOAT.cdc"
import FLOATVerifiers from "../../../../cadence/dev-challenge/FLOATVerifiers.cdc"
import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

transaction(
    name: String,
    description: String,
    image: String,
    url: String,
    bountyId: UInt64,
) {
    let FLOATEvents: &FLOAT.FLOATEvents

    prepare(acct: AuthAccount) {
         self.FLOATEvents = acct.borrow<&FLOAT.FLOATEvents>(from: FLOAT.FLOATEventsStoragePath)
            ?? panic("Could not borrow the FLOATEvents from the signer.")
    }

    execute {
        // ensure boutny exists
        let service = CompetitionService.borrowServicePublic()
        service.borrowBountyInfo(bountyId)

        // add verifier
        self.FLOATEvents.createEvent(
            claimable: true,
            description: description,
            image: image,
            name: name,
            transferrable: false,
            url: url,
            verifiers: [
                FLOATVerifiers.BountyCompleted(bountyId: bountyId)
            ],
            {},
            initialGroups: [])
        log("Started a new event for host.")
    }
}
