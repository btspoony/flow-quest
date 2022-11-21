import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

transaction(
    seasonId: UInt64,
    questKey: String,
    rewardPoints: UInt64,
    referalPoints: UInt64?,
    stackable: Bool?,
    limitation: UInt64?,
) {
    let admin: &CompetitionService.CompetitionAdmin

    prepare(acct: AuthAccount) {
        self.admin = acct.borrow<&CompetitionService.CompetitionAdmin>(from: CompetitionService.AdminStoragePath)
            ?? panic("Without admin resource")
    }

    execute {
        self.admin.addQuestConfig(seasonId: seasonId, quest: CompetitionService.QuestConfig(
            questKey: questKey,
            rewardPoints: rewardPoints,
            referalPoints: referalPoints,
            stackable: stackable,
            limitation: limitation,
        ))
    }
}
