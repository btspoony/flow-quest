/**
 * transactions for dev challenges
 */
import profileRegister from "./transactions/profile-register.cdc?raw";
import profileRegisterWithUser from "./transactions/profile-register-with-user.cdc?raw";
import claimFloat from "./transactions/claim-float.cdc?raw";
import spaceCreate from "./transactions/community-create.cdc?raw";
import spaceAddMissions from "./transactions/community-add-missions.cdc?raw";
import spaceAddChallenge from "./transactions/community-add-challenge-with-missions.cdc?raw";
import adminInitialize from "./transactions/admin-initialize.cdc?raw";
import adminStartNewSeason from "./transactions/admin-start-new-season.cdc?raw";
import adminUpdateEndDate from "./transactions/admin-update-end-date.cdc?raw";
import adminAddBounties from "./transactions/admin-add-bounties.cdc?raw";
import adminBountyUpdateProperty from "./transactions/admin-update-bounty-property.cdc?raw";

/**
 * scripts for mission checking
 */
import getFLOATEvent from "./scripts/get_event.cdc?raw";
import hasFLOATClaimed from "./scripts/has_claimed_event.cdc?raw";
import getActiveSeason from "./scripts/get_active_season.cdc?raw";
import getBountyById from "./scripts/get_bounty_by_id.cdc?raw";
import getBountiesDetail from "./scripts/get_bounties_detail.cdc?raw";
import getReferralAddrByCode from "./scripts/get_referral_addr_by_code.cdc?raw";
import getReferralCodeByAddr from "./scripts/get_referral_code_by_addr.cdc?raw";
import getRankingStatus from "./scripts/get_ranking_status.cdc?raw";
import getPlatformLinkedAddress from "./scripts/get_platform_linked_address.cdc?raw";
import getAdminStatus from "./scripts/is_admin.cdc?raw";
import profileExists from "./scripts/profile_exists.cdc?raw";
import profileGetMissionStatus from "./scripts/profile_get_mission_status.cdc?raw";
import profileIsRegistered from "./scripts/profile_is_registered.cdc?raw";
import profileGetSeasonRecord from "./scripts/profile_get_season_record.cdc?raw";
import profileIsBountyCompleted from "./scripts/profile_is_bounty_completed.cdc?raw";
import profileGetIdentities from "./scripts/profile_get_identities.cdc?raw";
import profilesGetIdentity from "./scripts/profiles_get_identity.cdc?raw";
import spaceGetAll from "./scripts/space_get_all.cdc?raw";
import spaceGetBasics from "./scripts/space_get_basics.cdc?raw";
import spaceGetBasicsByKey from "./scripts/space_get_basics_by_key.cdc?raw";
import spaceGetList from "./scripts/space_get_list.cdc?raw";
import spaceGetChallengeList from "./scripts/space_get_challenge_list.cdc?raw";
import spaceGetChallengeDetail from "./scripts/space_get_challenge_detail.cdc?raw";
import spaceGetMissionList from "./scripts/space_get_mission_list.cdc?raw";
import spaceSearchMissions from "./scripts/space_search_missions.cdc?raw";

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
        spaceCreate,
        spaceAddMissions,
        spaceAddChallenge,
    },
    scripts: {
        getFLOATEvent,
        hasFLOATClaimed,
        getActiveSeason,
        getBountyById,
        getBountiesDetail,
        getReferralAddrByCode,
        getReferralCodeByAddr,
        getRankingStatus,
        getPlatformLinkedAddress,
        getAdminStatus,
        // profile
        profileExists,
        profileIsRegistered,
        profileGetSeasonRecord,
        profileGetMissionStatus,
        profileIsBountyCompleted,
        profileGetIdentities,
        profilesGetIdentity,
        // spaces
        spaceGetAll,
        spaceGetBasics,
        spaceGetBasicsByKey,
        spaceGetList,
        spaceGetChallengeList,
        spaceGetChallengeDetail,
        spaceGetMissionList,
        spaceSearchMissions,
    },
};
