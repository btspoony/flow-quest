// Verify account address exists
pub fun main(
    acct: Address
) {
    let addr = getAccount(acct)
    log(addr.address)
}
