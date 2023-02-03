import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

transaction(
    endDate: UFix64,
    referralThreshold: UInt64
) {
    let admin: &CompetitionService.CompetitionAdmin

    prepare(acct: AuthAccount) {
        self.admin = acct.borrow<&CompetitionService.CompetitionAdmin>(from: CompetitionService.AdminStoragePath)
            ?? panic("Without admin resource")
    }

    execute {
        self.admin.startNewSeason(
            endDate: endDate,
            referralThreshold: referralThreshold,
        )
    }
}
