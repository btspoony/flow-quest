/**
 * transactions for dev challenges
 */
import profileRegister from "./transactions/profile-register.cdc?raw";

/**
 * scripts for quest checking
 */
import getFLOATEvent from "./scripts/get_event.cdc?raw";
import getActiveSeason from "./scripts/get_active_season.cdc?raw";

export default {
  transactions: {
    profileRegister,
  },
  scripts: {
    getFLOATEvent,
    getActiveSeason,
  },
};
