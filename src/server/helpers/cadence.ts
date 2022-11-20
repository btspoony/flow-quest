/**
 * Returns Cadence template code with replaced import addresses
 *
 * @param code - Cadence template code.
 * @param addressMap - name/address map or function to use as lookup table for addresses in import statements.
 * @param byName - lag to indicate whether we shall use names of the contracts.
 */
export function replaceImportAddresses(
  code: string,
  addressMap: ((key: string) => string) | { [key: string]: string },
  byName = true
): string {
  const REGEXP_IMPORT = /(\s*import\s*)([\w\d]+)(\s+from\s*)([\w\d"-.\\/]+)/g;

  return code.replace(
    REGEXP_IMPORT,
    (match, imp: string, contract: string, _, address: string) => {
      const key = byName ? contract : address;
      const newAddress =
        addressMap instanceof Function ? addressMap(key) : addressMap[key];

      // If the address is not inside addressMap we shall not alter import statement
      const validAddress = newAddress || address;
      return `${imp}${contract} from ${validAddress}`;
    }
  );
}

/**
 * transactions for dev challenges
 */
export { default as txProfileRegister } from "../../../cadence/dev-challenge/transactions/profile-register.cdc";
export { default as txAdminAddQuestConfig } from "../../../cadence/dev-challenge/transactions/admin-add-quest-cfg.cdc";
export { default as txAdminStartNewSeason } from "../../../cadence/dev-challenge/transactions/admin-start-new-season.cdc";
export { default as txAdminUpdateEndDate } from "../../../cadence/dev-challenge/transactions/admin-update-end-date.cdc";
export { default as txCtrlerAppendQuestParams } from "../../../cadence/dev-challenge/transactions/ctrler-append-quest-params.cdc";
export { default as txCtrlerSetQuestCompleted } from "../../../cadence/dev-challenge/transactions/ctrler-set-quest-completed.cdc";
export { default as txCtrlerSetQuestFailure } from "../../../cadence/dev-challenge/transactions/ctrler-set-quest-failure.cdc";
export { default as txCtrlerSetupReferralCode } from "../../../cadence/dev-challenge/transactions/ctrler-setup-referral-code.cdc";

/**
 * scripts for quest checking
 */
export { default as scVerifyQuestS1Q1 } from "../../../cadence/quests/S1Q1/verify-script.cdc";
