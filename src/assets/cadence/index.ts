/**
 * transactions for dev quests
 */
import profileRegister from "./transactions/profile-register.cdc?raw";
import profileRegisterWithUser from "./transactions/profile-register-with-user.cdc?raw";
import claimFloat from "./transactions/claim-float.cdc?raw";
import spaceCreate from "./transactions/community-create.cdc?raw";
import spaceAddMissions from "./transactions/community-add-missions.cdc?raw";
import spaceAddQuest from "./transactions/community-add-quest-with-missions.cdc?raw";
import spaceApplyFLOATinQuest from "./transactions/community-apply-FLOAT-in-quest.cdc?raw";
import adminInitialize from "./transactions/admin-initialize.cdc?raw";
import adminStartNewSeason from "./transactions/admin-start-new-season.cdc?raw";
import adminUpdateEndDate from "./transactions/admin-update-end-date.cdc?raw";
import adminAddBounties from "./transactions/admin-add-bounties.cdc?raw";
import adminBountyUpdateProperty from "./transactions/admin-update-bounty-property.cdc?raw";
import adminAddPreconditionBountyCompleted from "./transactions/admin-add-precondition-bounty-completed.cdc?raw";
import adminAddPreconditionFLOATRequired from "./transactions/admin-add-precondition-float-required.cdc?raw";
import adminAddPreconditionMinimumPoint from "./transactions/admin-add-precondition-minimum-point.cdc?raw";
import adminRemovePrecondition from "./transactions/admin-remove-precondition.cdc?raw";
import adminCreateFLOATinBounty from "./transactions/admin-create-FLOAT-in-bounty.cdc?raw";

/**
 * scripts for mission checking
 */
import getFLOATEvent from "./scripts/get-event.cdc?raw";
import hasFLOATClaimed from "./scripts/has-claimed-event.cdc?raw";
import getActiveSeason from "./scripts/get-active-season.cdc?raw";
import getBountyById from "./scripts/get-bounty-by-id.cdc?raw";
import getBountyUnlockStatus from "./scripts/get-bounty-unlock-status.cdc?raw";
import getBountiesDetail from "./scripts/get-bounties-detail.cdc?raw";
import getReferralAddrByCode from "./scripts/get-referral-addr-by-code.cdc?raw";
import getReferralCodeByAddr from "./scripts/get-referral-code-by-addr.cdc?raw";
import getRankingStatus from "./scripts/get-ranking-status.cdc?raw";
import getPlatformLinkedAddress from "./scripts/get-platform-linked-address.cdc?raw";
import getAdminStatus from "./scripts/is-admin.cdc?raw";
import profileExists from "./scripts/profile-exists.cdc?raw";
import profileGetMissionStatus from "./scripts/profile-get-mission-status.cdc?raw";
import profileIsRegistered from "./scripts/profile-is-registered.cdc?raw";
import profileGetProfileRecord from "./scripts/profile-get-profile-record.cdc?raw";
import profileIsBountyCompleted from "./scripts/profile-is-bounty-completed.cdc?raw";
import profileGetIdentities from "./scripts/profile-get-identities.cdc?raw";
import profilesGetIdentity from "./scripts/profiles-get-identity.cdc?raw";
import spaceGetAll from "./scripts/space-get-all.cdc?raw";
import spaceGetBasics from "./scripts/space-get-basics.cdc?raw";
import spaceGetBasicsByKey from "./scripts/space-get-basics-by-key.cdc?raw";
import spaceGetList from "./scripts/space-get-list.cdc?raw";
import spaceGetQuestList from "./scripts/space-get-quest-list.cdc?raw";
import spaceGetQuestDetail from "./scripts/space-get-quest-detail.cdc?raw";
import spaceGetMissionList from "./scripts/space-get-mission-list.cdc?raw";
import spaceSearchMissions from "./scripts/space-search-missions.cdc?raw";

export default {
    transactions: {
        profileRegister,
        profileRegisterWithUser,
        claimFloat,
        // Admin related
        adminInitialize,
        adminStartNewSeason,
        adminUpdateEndDate,
        adminAddBounties,
        adminBountyUpdateProperty,
        adminAddPreconditionBountyCompleted,
        adminAddPreconditionFLOATRequired,
        adminAddPreconditionMinimumPoint,
        adminRemovePrecondition,
        adminCreateFLOATinBounty,
        spaceApplyFLOATinQuest,
        spaceCreate,
        spaceAddMissions,
        spaceAddQuest,
    },
    scripts: {
        getFLOATEvent,
        hasFLOATClaimed,
        getActiveSeason,
        getBountyById,
        getBountyUnlockStatus,
        getBountiesDetail,
        getReferralAddrByCode,
        getReferralCodeByAddr,
        getRankingStatus,
        getPlatformLinkedAddress,
        getAdminStatus,
        // profile
        profileExists,
        profileIsRegistered,
        profileGetProfileRecord,
        profileGetMissionStatus,
        profileIsBountyCompleted,
        profileGetIdentities,
        profilesGetIdentity,
        // spaces
        spaceGetAll,
        spaceGetBasics,
        spaceGetBasicsByKey,
        spaceGetList,
        spaceGetQuestList,
        spaceGetQuestDetail,
        spaceGetMissionList,
        spaceSearchMissions,
    },
};
