import * as fcl from "@onflow/fcl";
import { send as grpcSend } from "@onflow/transport-grpc";
import cadence from "../assets/cadence";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  const isMainnet = config.public.network === "mainnet";
  const appName = "Flow Challenge Tour";

  // initialize fcl
  fcl
    .config()
    .put("flow.network", config.public.network)
    .put("accessNode.api", config.public.accessApi)
    .put("discovery.wallet", config.public.walletDiscovery)
    .put("sdk.transport", grpcSend)
    .put("app.detail.title", appName)
    .put(
      "app.detail.icon",
      window.location.origin + config.app.baseURL + "apple-touch-icon.png"
    )
    .put("service.OpenID.scopes", "email email_verified name zoneinfo")
    .put("fcl.limit", 9999)
    .put("fcl.accountProof.resolver", async () => {
      const data = await $fetch("/api/app-resolver");
      console.log("AccountProof Resolver:", data);
      return data;
    });

  // Address mapping
  const addressMapping = {
    MetadataViews: isMainnet ? "0x1d7e57aa55817448" : "0x631e88ae7f1d7c20",
    NonFungibleToken: isMainnet ? "0x1d7e57aa55817448" : "0x631e88ae7f1d7c20",
    FungibleToken: isMainnet ? "0xf233dcee88fe0abe" : "0x9a0766d93b6608b7",
    FlowToken: isMainnet ? "0x1654653399040a61" : "0x7e60df042a9c0868",
    FLOAT: isMainnet ? "0x2d4c3caffbeab845" : "0x0afe396ebc8eee65",
    // dApp address
    Interfaces: config.public.flowServiceAddress,
    Helper: config.public.flowServiceAddress,
    QueryStructs: config.public.flowServiceAddress,
    UserProfile: config.public.flowServiceAddress,
    FLOATVerifiers: config.public.flowServiceAddress,
    Community: config.public.flowServiceAddress,
    BountyUnlockConditions: config.public.flowServiceAddress,
    CompetitionService: config.public.flowServiceAddress,
  };
  // ------ Build scripts ------

  // ------ Build transactions ------
  const sendTransaction = async (
    code: string,
    args: fcl.ArgumentFunction
  ): Promise<string | null> => {
    let transactionId: string;

    try {
      transactionId = await fcl.mutate({
        cadence: replaceImportAddresses(code, addressMapping),
        args: args,
      });
      console.log("Tx Sent:", transactionId);
      return transactionId;
    } catch (e) {
      console.log(e);
      return null;
    }
  };

  /**
   * @param transactionId
   * @param onSealed
   * @param onStatusUpdated
   * @param onErrorOccured
   */
  const watchTransaction = (
    transactionId: string,
    onSealed: (txId: string, errorMsg?: string) => void | undefined,
    onStatusUpdated: (code: fcl.TransactionStatus) => void | undefined,
    onErrorOccured: (errorMsg: string) => void | undefined
  ) => {
    fcl.tx(transactionId).subscribe((res) => {
      if (onStatusUpdated) {
        onStatusUpdated(res.status);
      }

      if (res.status === 4) {
        if (res.statusCode !== 0 && onErrorOccured) {
          onErrorOccured(res.errorMessage);
        }
        // on sealed callback
        if (typeof onSealed === "function") {
          onSealed(
            transactionId,
            res.statusCode === 0 ? undefined : res.errorMessage
          );
        }
      }
    });
  };

  /**
   * @param code
   * @param args
   * @param defaultValue
   */
  const executeScript = async (
    code: string,
    args: fcl.ArgumentFunction,
    defaultValue: any
  ): Promise<any> => {
    try {
      const cadence = replaceImportAddresses(code, addressMapping);
      const queryResult = await fcl.query({
        cadence,
        args,
      });
      return queryResult ?? defaultValue;
    } catch (e) {
      console.error(e);
      return defaultValue;
    }
  };

  return {
    provide: {
      appName: () => appName,
      fcl,
      scripts: {
        /**
         * Get Bounties in the active season
         * @returns
         */
        async getActiveSeason(): Promise<CompetitionSeason> {
          const ret = await executeScript(
            cadence.scripts.getActiveSeason,
            (arg, t) => [],
            undefined
          );
          if (!ret) {
            throw new Error("Result undefined");
          }
          const bounties: { [key: string]: BountyInfo } = {};
          for (const id in ret.bounties) {
            bounties[id] = parseBountyInfo(ret.bounties[id]);
          }
          return {
            seasonId: ret.seasonID,
            endDate: parseInt(ret.endDate),
            bounties: bounties,
          };
        },
        /**
         * Get float information
         * @param host
         * @param eventId
         */
        async getFLOATDetail(
          host: string,
          eventId: string
        ): Promise<FLOATEvent> {
          return await executeScript(
            cadence.scripts.getFLOATEvent,
            (arg, t) => [arg(host, t.Address), arg(eventId, t.UInt64)],
            undefined
          );
        },
        /**
         * Get quests
         * @param quests
         */
        async getQuestsDetail(
          seasonId: string,
          quests: BountyIdentifier[]
        ): Promise<BountyInfo[]> {
          const result = await executeScript(
            cadence.scripts.getBountiesDetail,
            (arg, t) => [
              arg(seasonId, t.UInt64),
              arg(
                quests.map((one) => one.key),
                t.Array(t.String)
              ),
            ],
            []
          );
          if (quests.length !== result?.length) {
            throw new Error("Result invalid");
          }
          return result.map((one: any) => parseBountyInfo(one));
        },
        /**
         * get simple bounty info
         * @param id
         */
        async getBountyById(seasonId: string, id: string): Promise<BountyInfo> {
          const result = await executeScript(
            cadence.scripts.getBountyById,
            (arg, t) => [arg(seasonId, t.UInt64), arg(id, t.UInt64)],
            undefined
          );
          if (!result) {
            throw new Error("Result undefined");
          }
          return parseBountyInfo(result);
        },
        /**
         * get bounty info
         * @param key
         */
        async getBountyByKey(
          seasonId: string,
          key: string
        ): Promise<BountyInfo> {
          const result = await executeScript(
            cadence.scripts.getBountiesDetail,
            (arg, t) => [
              arg(seasonId, t.UInt64),
              arg([key], t.Array(t.String)),
            ],
            []
          );
          if (result?.length !== 1) {
            throw new Error("Result invalid");
          }
          return parseBountyInfo(result[0]);
        },
        /**
         * get quest status
         */
        async profileGetQuestStatus(
          acct: string,
          seasonId: string,
          key: string
        ): Promise<QuestStatus> {
          const result = await executeScript(
            cadence.scripts.profileGetQuestStatus,
            (arg, t) => [
              arg(acct, t.Address),
              arg(seasonId, t.UInt64),
              arg(key, t.String),
            ],
            undefined
          );
          if (!result) {
            throw new Error("Result undefined");
          }
          return result;
        },
        /**
         * get bounty completed
         */
        async profileIsBountyCompleted(
          acct: string,
          seasonId: string,
          bountyId: string
        ): Promise<boolean> {
          return await executeScript(
            cadence.scripts.profileGetQuestStatus,
            (arg, t) => [
              arg(acct, t.Address),
              arg(seasonId, t.UInt64),
              arg(bountyId, t.UInt64),
            ],
            false
          );
        },
        /**
         * check if profile registered
         */
        async isProfileRegistered(
          acct: string,
          seasonId: string
        ): Promise<boolean> {
          return await executeScript(
            cadence.scripts.profileIsRegistered,
            (arg, t) => [arg(acct, t.Address), arg(seasonId, t.UInt64)],
            false
          );
        },
        /**
         * check if profile created
         */
        async isProfileCreated(acct: string): Promise<boolean> {
          return await executeScript(
            cadence.scripts.profileExists,
            (arg, t) => [arg(acct, t.Address)],
            false
          );
        },
        /**
         * load profile season record
         */
        async loadProfileSeasonRecord(
          acct: string,
          seasonId: string | null = null
        ): Promise<SeasonRecord | undefined> {
          const result = await executeScript(
            cadence.scripts.profileGetSeasonRecord,
            (arg, t) => [
              arg(acct, t.Address),
              arg(seasonId, t.Optional(t.UInt64)),
            ],
            undefined
          );
          if (!result) return result;
          return parseProfileSeasonRecord(result);
        },
        /**
         * load user profile
         */
        async loadUserProfile(acct: string): Promise<ProfileData> {
          return {
            address: acct,
            activeRecord: await this.loadProfileSeasonRecord(acct),
          };
        },
      },
      transactions: {
        async registerForNewSeason(referredFrom?: string) {
          return sendTransaction(
            cadence.transactions.profileRegister,
            (arg, t) => [arg(referredFrom, t.Optional(t.Address))]
          );
        },
      },
      watchTransaction,
    },
  };
});

/**
 * Returns Cadence template code with replaced import addresses
 *
 * @param code - Cadence template code.
 * @param addressMap - name/address map or function to use as lookup table for addresses in import statements.
 * @param byName - lag to indicate whether we shall use names of the contracts.
 */
function replaceImportAddresses(
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
