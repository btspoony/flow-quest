/**
 * transactions for dev challenges
 */
import profileRegister from "./transactions/profile-register.cdc?raw";

/**
 * scripts for quest checking
 */
import getFLOATEvent from "./scripts/get_event.cdc?raw";
import getActiveSeason from "./scripts/get_active_season.cdc?raw";
import getBountiesDetail from "./scripts/get_bounties_detail.cdc?raw";
import getBountyById from "./scripts/get_bounty_by_id.cdc?raw";

export default {
  transactions: {
    profileRegister,
  },
  scripts: {
    getFLOATEvent,
    getActiveSeason,
    getBountyById,
    getBountiesDetail,
  },
};
