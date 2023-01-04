import * as fcl from "@onflow/fcl";
import { send as grpcSend } from "@onflow/transport-grpc";
import cadence from "../assets/cadence";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  const isMainnet = config.public.network === "mainnet";

  // initialize fcl
  fcl
    .config()
    .put("flow.network", config.public.network)
    .put("accessNode.api", config.public.accessApi)
    .put("discovery.wallet", config.public.walletDiscovery)
    .put("sdk.transport", grpcSend)
    .put("app.detail.title", config.public.appName)
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
  ): Promise<string> => {
    let transactionId: string;

    try {
      transactionId = await fcl.mutate({
        cadence: replaceImportAddresses(code, addressMapping),
        args: args,
      });
      console.log("Tx Sent:", transactionId);
      return transactionId;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
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
    const cadence = replaceImportAddresses(code, addressMapping);
    try {
      const queryResult = await fcl.query({
        cadence,
        args,
      });
      return queryResult ?? defaultValue;
    } catch (e) {
      console.error(`[CODE]: ${cadence}`, args, e);
      return defaultValue;
    }
  };

  return {
    provide: {
      appName: () => config.public.appName,
      fcl,
      scripts: {
        /**
         * Get Bounties in the active season
         * @returns
         */
        async getActiveSeason(): Promise<CompetitionSeason | null> {
          const ret = await executeScript(
            cadence.scripts.getActiveSeason,
            (arg, t) => [],
            null
          );
          if (!ret) return null;

          const bounties: { [key: string]: BountyInfo } = {};
          for (const id in ret.bounties) {
            bounties[id] = parseBountyInfo(ret.bounties[id]);
          }
          return {
            seasonId: ret.seasonID,
            endDate: parseInt(ret.endDate),
            referralThreshold: parseInt(ret.referralThreshold),
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
         * check if float claimed
         */
        async hasFLOATClaimed(
          host: string,
          eventId: string,
          account: string
        ): Promise<boolean> {
          const ret = await executeScript(
            cadence.scripts.hasFLOATClaimed,
            (arg, t) => [
              arg(host, t.Address),
              arg(eventId, t.UInt64),
              arg(account, t.Address),
            ],
            false
          );
          return !!ret;
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
         * get referral address
         */
        async getReferralAddrByCode(code: string): Promise<string | null> {
          const result = await executeScript(
            cadence.scripts.getReferralAddrByCode,
            (arg, t) => [arg(code, t.String)],
            null
          );
          return result;
        },
        /**
         * get referral code
         */
        async getReferralCodeByAddr(address: string): Promise<string | null> {
          const result = await executeScript(
            cadence.scripts.getReferralCodeByAddr,
            (arg, t) => [arg(address, t.Address)],
            null
          );
          return result;
        },
        /**
         * get ranking
         */
        async getRankingStatus(
          limit = 100,
          address: string | null = null
        ): Promise<RankingStatus | null> {
          const result = await executeScript(
            cadence.scripts.getRankingStatus,
            (arg, t) => [
              arg(String(limit), t.Optional(t.Int)),
              arg(address, t.Optional(t.Address)),
            ],
            null
          );
          let acctRankingScore: RankingScore | undefined = undefined;
          if (
            address &&
            typeof result.accountPoint === "string" &&
            typeof result.accountRank === "string"
          ) {
            acctRankingScore = {
              account: address,
              rank: parseInt(result.accountRank) + 1,
              score: parseInt(result.accountPoint),
            };
          }
          const topsScores: RankingScore[] = [];
          if (typeof result.tops === "object") {
            for (const score in result.tops) {
              const addrs = result.tops[score];
              for (const address of addrs) {
                topsScores.push({
                  account: address,
                  score: typeof score === "number" ? score : parseInt(score),
                  rank: 0,
                });
              }
            } // end for
            topsScores.sort((a, b) => b.score - a.score);
            let rank = 1;
            topsScores.forEach((one) => {
              one.rank = rank++;
            });
          }
          return {
            account: acctRankingScore,
            tops: topsScores,
          };
        },
        /**
         * get address
         */
        async getPlatformLinkedAddress(
          platform: string,
          uid: string
        ): Promise<string | null> {
          return await executeScript(
            cadence.scripts.getPlatformLinkedAddress,
            (arg, t) => [arg(platform, t.String), arg(uid, t.String)],
            null
          );
        },
        /**
         * get quest status
         */
        async profileGetQuestStatus(
          acct: string,
          seasonId: string,
          key: string
        ): Promise<QuestStatus | null> {
          return await executeScript(
            cadence.scripts.profileGetQuestStatus,
            (arg, t) => [
              arg(acct, t.Address),
              arg(seasonId, t.UInt64),
              arg(key, t.String),
            ],
            null
          );
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
            cadence.scripts.profileIsBountyCompleted,
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
         * Get profiles' identity
         */
        async profilesGetIdentity(
          accts: string[]
        ): Promise<AccountProfileIdentity[]> {
          const result = await executeScript(
            cadence.scripts.profilesGetIdentity,
            (arg, t) => [arg(accts, t.Array(t.Address))],
            []
          );
          if (!Array.isArray(result)) return [];
          return result.map((one) => {
            one.identity.display = parseDisplay(one.identity.display);
            return one;
          });
        },
        /**
         * load profile get identities
         */
        async loadProfileGetIdentities(
          acct: string
        ): Promise<ProfileIdentity[]> {
          const result = await executeScript(
            cadence.scripts.profileGetIdentities,
            (arg, t) => [arg(acct, t.Address)],
            []
          );
          if (!Array.isArray(result)) return [];
          return result.map((one) => {
            one.display = parseDisplay(one.display);
            return one;
          });
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
        // Spaces
        /**
         * Get community space basics
         * @param communityId
         */
        async spaceGetBasics(
          communityId: string
        ): Promise<CommunitySpaceBasics | null> {
          return await executeScript(
            cadence.scripts.spaceGetBasics,
            (arg, t) => [arg(communityId, t.UInt64)],
            null
          );
        },
        /**
         * get community space list
         * @param acct address
         */
        async spaceGetList(acct: string): Promise<CommunitySpaceBasics[]> {
          return await executeScript(
            cadence.scripts.spaceGetList,
            (arg, t) => [arg(acct, t.Address)],
            []
          );
        },
        /**
         * get challenge list
         * @param communityKey
         */
        async spaceGetChallengeList(
          communityKey: string,
          opt?: ListReqOption
        ): Promise<ChallengeConfig[]> {
          const result = await executeScript(
            cadence.scripts.spaceGetChallengeList,
            (arg, t) => [
              arg(communityKey, t.String),
              arg(opt?.page ? String(opt?.page) : null, t.Int),
              arg(opt?.limit ? String(opt?.limit) : null, t.Int),
            ],
            []
          );
          if (!result || result.length === 0) {
            return [];
          }
          return result.map((one: any) => parseChallengeInfo(one));
        },
        /**
         * get challenge detail
         * @param communityKey
         * @param challengeKey
         */
        async spaceGetChallengeDetail(
          communityKey: string,
          challengeKey: string
        ): Promise<ChallengeConfigDetail | null> {
          const result = await executeScript(
            cadence.scripts.spaceGetChallengeDetail,
            (arg, t) => [
              arg(communityKey, t.String),
              arg(challengeKey, t.String),
            ],
            null
          );
          if (!result) return result;
          return parseChallengeInfoDetail(result);
        },
        /**
         * get quest list
         * @param communityKey
         */
        async spaceGetQuestList(
          communityKey: string,
          opt?: ListReqOption
        ): Promise<QuestConfig[]> {
          const result = await executeScript(
            cadence.scripts.spaceGetQuestList,
            (arg, t) => [
              arg(communityKey, t.String),
              arg(opt?.page ? String(opt?.page) : null, t.Int),
              arg(opt?.limit ? String(opt?.limit) : null, t.Int),
            ],
            []
          );
          if (!result || result.length === 0) {
            return [];
          }
          return result.map((one: any) => parseQuestInfo(one));
        },
        /**
         * search quests by key
         * @param communityKey
         * @param searchKey
         */
        async spaceSearchQuests(
          communityKey: string,
          searchKey: string
        ): Promise<QuestConfig[]> {
          const result = await executeScript(
            cadence.scripts.spaceSearchQuests,
            (arg, t) => [arg(communityKey, t.String), arg(searchKey, t.String)],
            []
          );
          if (!result || result.length === 0) {
            return [];
          }
          return result.map((one: any) => parseQuestInfo(one));
        },
      },
      transactions: {
        /**
         * User Profile registeration
         */
        async registerForNewSeason(referredFrom: string | null) {
          const user = useGithubProfile();
          let result;
          if (user.value && user.value.data) {
            result = await sendTransaction(
              cadence.transactions.profileRegisterWithUser,
              (arg, t) => [
                arg(referredFrom, t.Optional(t.Address)),
                arg("github", t.Optional(t.String)),
                arg(String(user.value.data?.id), t.Optional(t.String)), // userId: String?,
                arg(user.value.data?.userName, t.Optional(t.String)), // userName: String?,
                arg(user.value.data?.bio, t.Optional(t.String)), // userBio: String?,
                arg(user.value.data?.avatarUrl, t.Optional(t.String)), // userImage: String?,
              ]
            );
            console.log(`Registered with github profile.`);
          } else {
            result = await sendTransaction(
              cadence.transactions.profileRegister,
              (arg, t) => [arg(referredFrom, t.Optional(t.Address))]
            );
            console.log(`Registered without github profile.`);
          }
          return result;
        },
        /**
         * claim float
         */
        async claimFloat(host: string, eventId: string) {
          return await sendTransaction(
            cadence.transactions.claimFloat,
            (arg, t) => [arg(host, t.Address), arg(eventId, t.UInt64)]
          );
        },
        /**
         * create a new space
         */
        async spaceCreate(
          key: string,
          name: string,
          description: string,
          image: string,
          banner?: string,
          twitter?: string,
          discord?: string,
          website?: string
        ) {
          return await sendTransaction(
            cadence.transactions.spaceCreate,
            (arg, t) => [
              arg(key, t.String),
              arg(name, t.String),
              arg(description, t.String),
              arg(image, t.String),
              arg(banner, t.Optional(t.String)),
              arg(twitter, t.Optional(t.String)),
              arg(discord, t.Optional(t.String)),
              arg(website, t.Optional(t.String)),
            ]
          );
        },
        /**
         * add quest to a community space
         */
        async spaceAddQuests(spaceKey: string, quests: QuestConfigRequest[]) {
          const data = quests.reduce(
            (prev, curr) => {
              prev.keys.push(curr.key);
              prev.titles.push(curr.name);
              prev.descs.push(curr.description);
              prev.images.push(curr.thumbnail ?? null);
              prev.steps.push(String(curr.steps));
              prev.stepCfgs.push(curr.stepsCfg);
              prev.guildMD.push(curr.guideMD);
              return prev;
            },
            {
              keys: [] as string[],
              titles: [] as string[],
              descs: [] as string[],
              images: [] as (string | null)[],
              steps: [] as string[],
              stepCfgs: [] as string[],
              guildMD: [] as string[],
            }
          );
          return await sendTransaction(
            cadence.transactions.spaceAddQuests,
            (arg, t) => [
              arg(spaceKey, t.String),
              arg(data.keys, t.Array(t.String)),
              arg(data.titles, t.Array(t.String)),
              arg(data.descs, t.Array(t.String)),
              arg(data.images, t.Array(t.Optional(t.String))),
              arg(data.steps, t.Array(t.UInt64)),
              arg(data.stepCfgs, t.Array(t.String)),
              arg(data.guildMD, t.Array(t.String)),
            ]
          );
        },
        /**
         * Add challenge to a community space
         */
        async spaceAddChallenge(
          spaceKey: string,
          key: string,
          display: Display,
          existsQuestKeys: string[],
          newQuests: QuestConfigRequest[],
          achievement?: FLOATAchievement
        ) {
          const newQuestData = newQuests.reduce(
            (prev, curr) => {
              prev.keys.push(curr.key);
              prev.titles.push(curr.name);
              prev.descs.push(curr.description);
              prev.images.push(curr.thumbnail ?? null);
              prev.steps.push(String(curr.steps));
              prev.stepCfgs.push(curr.stepsCfg);
              prev.guildMD.push(curr.guideMD);
              return prev;
            },
            {
              keys: [] as string[],
              titles: [] as string[],
              descs: [] as string[],
              images: [] as (string | null)[],
              steps: [] as string[],
              stepCfgs: [] as string[],
              guildMD: [] as string[],
            }
          );
          return await sendTransaction(
            cadence.transactions.spaceAddChallenge,
            (arg, t) => [
              arg(spaceKey, t.String),
              arg(key, t.String),
              arg(display.name, t.String),
              arg(display.description, t.String),
              arg(display.thumbnail, t.String),
              // Quest
              arg(existsQuestKeys, t.Array(t.String)),
              arg(newQuestData.keys, t.Array(t.String)),
              arg(newQuestData.titles, t.Array(t.String)),
              arg(newQuestData.descs, t.Array(t.String)),
              arg(newQuestData.images, t.Array(t.Optional(t.String))),
              arg(newQuestData.steps, t.Array(t.UInt64)),
              arg(newQuestData.stepCfgs, t.Array(t.String)),
              arg(newQuestData.guildMD, t.Array(t.String)),
              // Achievement
              arg(achievement ? achievement.host : null, t.Optional(t.Address)),
              arg(
                achievement ? achievement.eventId : null,
                t.Optional(t.UInt64)
              ),
            ]
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
