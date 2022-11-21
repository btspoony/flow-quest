/**
 * transactions for dev challenges
 */
import profileRegister from "./transactions/profile-register.cdc?raw";
import adminAddQuestConfig from "./transactions/admin-add-quest-cfg.cdc?raw";
import adminStartNewSeason from "./transactions/admin-start-new-season.cdc?raw";
import adminUpdateEndDate from "./transactions/admin-update-end-date.cdc?raw";
import ctrlerAppendQuestParams from "./transactions/ctrler-append-quest-params.cdc?raw";
import ctrlerSetQuestCompleted from "./transactions/ctrler-set-quest-completed.cdc?raw";
import ctrlerSetQuestFailure from "./transactions/ctrler-set-quest-failure.cdc?raw";
import ctrlerSetupReferralCode from "./transactions/ctrler-setup-referral-code.cdc?raw";

/**
 * scripts for quest checking
 */
import verifyQuestS1Q1 from "./quests/S1Q1/verify-script.cdc?raw";

const quests: { [key: string]: string } = {};
quests["S1Q1"] = verifyQuestS1Q1;

export default {
  transactions: {
    profileRegister,
    adminAddQuestConfig,
    adminStartNewSeason,
    adminUpdateEndDate,
    ctrlerAppendQuestParams,
    ctrlerSetQuestCompleted,
    ctrlerSetQuestFailure,
    ctrlerSetupReferralCode,
  },
  scripts: {},
  quests,
};
