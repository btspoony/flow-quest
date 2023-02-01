// import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
// import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
import Community from "../../../../cadence/dev-challenge/Community.cdc"
// import Helper from "../../../../cadence/dev-challenge/Helper.cdc"
import FLOAT from "../../../../cadence/deps/FLOAT.cdc"
import FLOATVerifiers from "../../../../cadence/dev-challenge/FLOATVerifiers.cdc"
// import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

transaction(
    name: String,
    description: String,
    image: String,
    url: String,
    communityKey: String,
    missionKey: String,
) {
    let FLOATEvents: &FLOAT.FLOATEvents

    prepare(acct: AuthAccount) {
         self.FLOATEvents = acct.borrow<&FLOAT.FLOATEvents>(from: FLOAT.FLOATEventsStoragePath)
            ?? panic("Could not borrow the FLOATEvents from the signer.")
    }

    execute {
        let community = Community.borrowCommunityByKey(key: communityKey)
            ?? panic("Failed to find community")
        community.borrowMissionRef(key: missionKey) ?? panic("Failed to load mission")

        // add verifier
        self.FLOATEvents.createEvent(
            claimable: true,
            description: description,
            image: image,
            name: name,
            transferrable: false,
            url: url,
            verifiers: [
                FLOATVerifiers.MissionCompleted(missionKey: missionKey)
            ],
            {},
            initialGroups: [])
        log("Started a new event for host.")
    }
}
