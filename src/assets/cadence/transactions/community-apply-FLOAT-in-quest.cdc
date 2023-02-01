// import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
// import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
import Community from "../../../../cadence/dev-challenge/Community.cdc"
import Helper from "../../../../cadence/dev-challenge/Helper.cdc"
import FLOAT from "../../../../cadence/deps/FLOAT.cdc"
import FLOATVerifiers from "../../../../cadence/dev-challenge/FLOATVerifiers.cdc"
// import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

transaction(
    name: String,
    description: String,
    image: String,
    url: String,
    communityId: UInt64,
    questKey: String,
) {
    let FLOATEvents: &FLOAT.FLOATEvents
    let communityIns: &Community.CommunityIns

    prepare(acct: AuthAccount) {
        self.FLOATEvents = acct.borrow<&FLOAT.FLOATEvents>(from: FLOAT.FLOATEventsStoragePath)
            ?? panic("Could not borrow the FLOATEvents from the signer.")

        let builder = acct.borrow<&Community.CommunityBuilder>(from: Community.CommunityStoragePath) ?? panic("Failed to load builder.")
        self.communityIns = builder.borrowCommunityPrivateRef(id: communityId)
        assert(self.communityIns.owner!.address == acct.address, message: "Community is owned by AuthAccount")
    }

    execute {
        let questRef = self.communityIns.borrowQuestRef(key: questKey) ?? panic("Failed to load quest")
        let lastMission = questRef.missions[questRef.missions.length - 1]

        // add verifier
        let newEventId = self.FLOATEvents.createEvent(
            claimable: true,
            description: description,
            image: image,
            name: name,
            transferrable: false,
            url: url,
            verifiers: [
                FLOATVerifiers.MissionCompleted(missionKey: lastMission.key)
            ],
            {},
            initialGroups: []
        )

        self.communityIns.updateQuestAchievement(
            key: questKey,
            achi: Helper.EventIdentifier(self.communityIns.owner!.address, newEventId)
        )
    }
}
