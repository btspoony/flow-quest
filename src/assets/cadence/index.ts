/**
 * transactions for dev challenges
 */
import profileRegister from "./transactions/profile-register.cdc?raw";
import profileRegisterWithUser from "./transactions/profile-register-with-user.cdc?raw";
import claimFloat from "./transactions/claim-float.cdc?raw";

/**
 * scripts for quest checking
 */
import getFLOATEvent from "./scripts/get_event.cdc?raw";
import hasFLOATClaimed from "./scripts/has_claimed_event.cdc?raw";
import getActiveSeason from "./scripts/get_active_season.cdc?raw";
import getBountyById from "./scripts/get_bounty_by_id.cdc?raw";
import getBountiesDetail from "./scripts/get_bounties_detail.cdc?raw";
import getCommunityBasics from "./scripts/get_community_basics.cdc?raw";
import getReferralAddrByCode from "./scripts/get_referral_addr_by_code.cdc?raw";
import getReferralCodeByAddr from "./scripts/get_referral_code_by_addr.cdc?raw";
import getRankingStatus from "./scripts/get_ranking_status.cdc?raw";
import profileExists from "./scripts/profile_exists.cdc?raw";
import profileGetQuestStatus from "./scripts/profile_get_quest_status.cdc?raw";
import profileIsRegistered from "./scripts/profile_is_registered.cdc?raw";
import profileGetSeasonRecord from "./scripts/profile_get_season_record.cdc?raw";
import profileIsBountyCompleted from "./scripts/profile_is_bounty_completed.cdc?raw";
import profileGetIdentities from "./scripts/profile_get_identities.cdc?raw";
import profilesGetIdentity from "./scripts/profiles_get_identity.cdc?raw";

export default {
    transactions: {
        profileRegister,
        profileRegisterWithUser,
        claimFloat,
    },
    scripts: {
        getFLOATEvent,
        hasFLOATClaimed,
        getActiveSeason,
        getBountyById,
        getBountiesDetail,
        getCommunityBasics,
        getReferralAddrByCode,
        getReferralCodeByAddr,
        getRankingStatus,
        profileExists,
        profileIsRegistered,
        profileGetSeasonRecord,
        profileGetQuestStatus,
        profileIsBountyCompleted,
        profileGetIdentities,
        profilesGetIdentity,
    },
};
