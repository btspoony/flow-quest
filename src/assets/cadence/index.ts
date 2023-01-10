/**
 * transactions for dev challenges
 */
import profileRegister from "./transactions/profile-register.cdc?raw";
import profileRegisterWithUser from "./transactions/profile-register-with-user.cdc?raw";
import claimFloat from "./transactions/claim-float.cdc?raw";
import adminInitialize from "./transactions/admin-initialize.cdc?raw";
import spaceCreate from "./transactions/community-create.cdc?raw";
import spaceAddQuests from "./transactions/community-add-quests.cdc?raw";
import spaceAddChallenge from "./transactions/community-add-challenge-with-quests.cdc?raw";

/**
 * scripts for quest checking
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
import profileGetQuestStatus from "./scripts/profile_get_quest_status.cdc?raw";
import profileIsRegistered from "./scripts/profile_is_registered.cdc?raw";
import profileGetSeasonRecord from "./scripts/profile_get_season_record.cdc?raw";
import profileIsBountyCompleted from "./scripts/profile_is_bounty_completed.cdc?raw";
import profileGetIdentities from "./scripts/profile_get_identities.cdc?raw";
import profilesGetIdentity from "./scripts/profiles_get_identity.cdc?raw";
import spaceGetBasics from "./scripts/space_get_basics.cdc?raw";
import spaceGetBasicsByKey from "./scripts/space_get_basics_by_key.cdc?raw";
import spaceGetList from "./scripts/space_get_list.cdc?raw";
import spaceGetChallengeList from "./scripts/space_get_challenge_list.cdc?raw";
import spaceGetChallengeDetail from "./scripts/space_get_challenge_detail.cdc?raw";
import spaceGetQuestList from "./scripts/space_get_quest_list.cdc?raw";
import spaceSearchQuests from "./scripts/space_search_quests.cdc?raw";

export default {
    transactions: {
        profileRegister,
        profileRegisterWithUser,
        claimFloat,
        // Admin related
        adminInitialize,
        spaceCreate,
        spaceAddQuests,
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
        profileGetQuestStatus,
        profileIsBountyCompleted,
        profileGetIdentities,
        profilesGetIdentity,
        // spaces
        spaceGetBasics,
        spaceGetBasicsByKey,
        spaceGetList,
        spaceGetChallengeList,
        spaceGetChallengeDetail,
        spaceGetQuestList,
        spaceSearchQuests,
    },
};
