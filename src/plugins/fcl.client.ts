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
          // FIXME: load from blockchain
          return Promise.resolve([
            await this.getBountyByKey(seasonId, "create-account"),
            {
              id: "102",
              config: {
                category: "quest",
                key: "s1q2",
                communityId: "flow",
                display: {
                  name: "Quest 2",
                  description: "quest description",
                  thumbnail:
                    "bafkreifzkygc5x4lfju4y46o2cvxizkclrghzjswbawf4a25o6vbs2olla",
                },
                steps: 1,
                stepsCfg:
                  "https://raw.githubusercontent.com/btspoony/cadence-challenges/main/quests/create-account/verify.json",
                guideMD:
                  "https://raw.githubusercontent.com/btspoony/cadence-challenges/main/quests/create-account/README.md",
              },
              preconditions: [],
              participants: {},
              participantAmt: 0,
              rewardType: "Points",
              pointReward: {
                rewardType: "Points",
                rewardPoints: 50,
                referalPoints: 5,
              },
            },
            {
              id: "103",
              config: {
                category: "quest",
                key: "s1q3",
                communityId: "flow",
                display: {
                  name: "Quest 3",
                  description: "quest description",
                  thumbnail:
                    "bafkreifzkygc5x4lfju4y46o2cvxizkclrghzjswbawf4a25o6vbs2olla",
                },
                steps: 1,
                stepsCfg:
                  "https://raw.githubusercontent.com/btspoony/cadence-challenges/main/quests/create-account/verify.json",
                guideMD:
                  "https://raw.githubusercontent.com/btspoony/cadence-challenges/main/quests/create-account/README.md",
              },
              preconditions: [],
              participants: {},
              participantAmt: 0,
              rewardType: "Points",
              pointReward: {
                rewardType: "Points",
                rewardPoints: 50,
                referalPoints: 5,
              },
            },
          ]);
        },
        /**
         * get simple bounty info
         * @param id
         */
        async getBountyById(seasonId: string, id: string): Promise<BountyInfo> {
          // FIXME: load from blockchain
          return Promise.resolve({
            id: "001",
            config: {
              category: "challenge",
              key: "create-account",
              communityId: "flow",
              display: {
                name: "Challenge: Create Account",
                description: "Challenge description",
                thumbnail:
                  "bafkreifzkygc5x4lfju4y46o2cvxizkclrghzjswbawf4a25o6vbs2olla",
              },
              quests: [
                {
                  category: "quest",
                  key: "S1Q1",
                  communityId: "flow",
                },
                {
                  category: "quest",
                  key: "S1Q2",
                  communityId: "flow",
                },
                {
                  category: "quest",
                  key: "S1Q3",
                  communityId: "flow",
                },
              ],
              achievement: {
                host: "0xa51d7fe9e0080662",
                eventId: "97505692",
              },
            },
            preconditions: [],
            participants: {},
            participantAmt: 0,
            rewardType: "None",
          });
        },
        /**
         * get bounty info
         * @param key
         */
        async getBountyByKey(
          seasonId: string,
          key: string
        ): Promise<BountyInfo> {
          // FIXME: load from blockchain
          return Promise.resolve({
            id: "101",
            config: {
              category: "quest",
              key: "create-account",
              communityId: "flow",
              display: {
                name: "Quest 1",
                description: "quest description",
                thumbnail:
                  "bafkreifzkygc5x4lfju4y46o2cvxizkclrghzjswbawf4a25o6vbs2olla",
              },
              steps: 2,
              stepsCfg:
                "https://raw.githubusercontent.com/btspoony/cadence-challenges/main/quests/create-account/verify.json",
              guideMD:
                "https://raw.githubusercontent.com/btspoony/cadence-challenges/main/quests/create-account/README.md",
            },
            preconditions: [],
            participants: {},
            participantAmt: 0,
            rewardType: "Points",
            pointReward: {
              rewardType: "Points",
              rewardPoints: 20,
              referalPoints: 2,
            },
          });
        },
        /**
         * get quest status
         */
        async getQuestStatus(
          acct: string,
          seasonId: string,
          key: string
        ): Promise<QuestStatus> {
          // FIXME: load from blockchain
          return Promise.resolve({
            steps: [true, false, false],
            completed: false,
          });
        },
        async isProfileExists(acct: string): Promise<boolean> {
          // FIXME: load from blockchain
          return Promise.resolve(false);
        },
        async isProfileRegistered(acct: string): Promise<boolean> {
          // FIXME: load from blockchain
          return Promise.resolve(false);
        },
        async loadUserProfile(acct: string): Promise<ProfileData> {
          // FIXME: load from blockchain
          return Promise.resolve({} as ProfileData);
        },
        async loadProfileSeasonRecord(
          acct: string,
          seasonId: string
        ): Promise<SeasonRecord> {
          // FIXME: load from blockchain
          return Promise.resolve({} as SeasonRecord);
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
