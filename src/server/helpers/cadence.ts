/**
 * transactions for dev challenges
 */
export { default as txProfileRegister } from "~/assets/cadence/transactions/profile-register.cdc?raw";
export { default as txAdminAddQuestConfig } from "~/assets/cadence/transactions/admin-add-quest-cfg.cdc?raw";
export { default as txAdminStartNewSeason } from "~/assets/cadence/transactions/admin-start-new-season.cdc?raw";
export { default as txAdminUpdateEndDate } from "~/assets/cadence/transactions/admin-update-end-date.cdc?raw";
export { default as txCtrlerAppendQuestParams } from "~/assets/cadence/transactions/ctrler-append-quest-params.cdc?raw";
export { default as txCtrlerSetQuestCompleted } from "~/assets/cadence/transactions/ctrler-set-quest-completed.cdc?raw";
export { default as txCtrlerSetQuestFailure } from "~/assets/cadence/transactions/ctrler-set-quest-failure.cdc?raw";
export { default as txCtrlerSetupReferralCode } from "~/assets/cadence/transactions/ctrler-setup-referral-code.cdc?raw";

/**
 * scripts for quest checking
 */
export { default as scVerifyQuestS1Q1 } from "~/assets/cadence/quests/S1Q1/verify-script.cdc?raw";
