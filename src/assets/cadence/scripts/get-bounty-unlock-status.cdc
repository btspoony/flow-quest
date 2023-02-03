import MetadataViews from "../../../../cadence/deps/MetadataViews.cdc"
import Helper from "../../../../cadence/dev-challenge/Helper.cdc"
import Interfaces from "../../../../cadence/dev-challenge/Interfaces.cdc"
import QueryStructs from "../../../../cadence/dev-challenge/QueryStructs.cdc"
import Community from "../../../../cadence/dev-challenge/Community.cdc"
import UserProfile from "../../../../cadence/dev-challenge/UserProfile.cdc"
import CompetitionService from "../../../../cadence/dev-challenge/CompetitionService.cdc"

pub fun main(
    bountyId: UInt64,
    acct: Address,
): [Bool] {
    let service = CompetitionService.borrowServicePublic()
    let bounty = service.borrowBountyDetail(bountyId)
    let preconditions = bounty.getPreconditions()

    let ret: [Bool] = []
    let params: {String: AnyStruct} = {
        "profile": acct
    }
    for cond in preconditions {
        ret.append(cond.isUnlocked(params))
    }
    return ret
}
