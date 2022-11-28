import Interfaces from "../../../../../cadence/dev-challenge/Interfaces.cdc"
import UserProfile from "../../../../../cadence/dev-challenge/UserProfile.cdc"
import CompetitionService from "../../../../../cadence/dev-challenge/CompetitionService.cdc"

transaction(
    questKeys: [String],
    rewardPoints: [UInt64],
    referalPoints: [UInt64],
    stackable: [Bool],
    limitation: [UInt64],
    endDate: UFix64,
) {
    let admin: &CompetitionService.CompetitionAdmin

    prepare(acct: AuthAccount) {
        self.admin = acct.borrow<&CompetitionService.CompetitionAdmin>(from: CompetitionService.AdminStoragePath)
            ?? panic("Without admin resource")
    }

    execute {
        let quests: [CompetitionService.QuestConfig] = []

        var i = 0
        let len = questKeys.length
        while i < len {
            quests.append(CompetitionService.QuestConfig(
                questKey: questKeys[i],
                rewardPoints: rewardPoints[i],
                referalPoints: referalPoints[i],
                stackable: stackable[i],
                limitation: limitation[i],
            ))
            i = i + 1
        }

        self.admin.startNewSeason(endDate: endDate, quests: quests)
    }
}
