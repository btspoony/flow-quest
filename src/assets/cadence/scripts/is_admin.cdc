// import MetadataViews from "../../../../cadence/deps/MetadataViews.cdc"
// import Helper from "../../../../cadence/dev-challenge/Helper.cdc"
// import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
// import QueryStructs from "../../../../cadence/dev-challenge/QueryStructs.cdc"
// import Community from "../../../../cadence/dev-challenge/Community.cdc"
// import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

pub fun main(acct: Address): AdminStatus {

    let service = CompetitionService.borrowServicePublic()
    let isValid: Bool = service.isAdminValid(acct)

    var isEnabled: Bool = false
    let tmpAccount = getAuthAccount(acct)
    if let admin = tmpAccount.borrow<&CompetitionService.CompetitionAdmin>(from: CompetitionService.AdminStoragePath) {
        isEnabled = true
    }

    return AdminStatus(valid: isValid, enabled: isEnabled)
}

pub struct AdminStatus {
    pub let valid: Bool
    pub let enabled: Bool

    init(
        valid: Bool,
        enabled: Bool,
    ) {
        self.valid = valid
        self.enabled = enabled
    }
}
