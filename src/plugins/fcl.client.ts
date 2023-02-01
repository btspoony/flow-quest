import * as fcl from "@onflow/fcl";
import { send as grpcSend } from "@onflow/transport-grpc";
import cadence from "../assets/cadence";

export default defineNuxtPlugin((nuxtApp) => {
  const appConfig = useAppConfig();
  const config = useRuntimeConfig();

  const isMainnet = config.public.network === "mainnet";

  // initialize fcl
  fcl
    .config()
    .put("flow.network", config.public.network)
    .put("accessNode.api", config.public.accessApi)
    .put("discovery.wallet", config.public.walletDiscovery)
    .put("sdk.transport", grpcSend)
    .put("app.detail.title", appConfig.title)
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
      fcl,
      scripts: {
        /**
         * Get Bounties in the active season
         * @returns
         */
        async getActiveSeason(
          includeUnlaunched = false
        ): Promise<CompetitionSeason | null> {
          const ret = await executeScript(
            cadence.scripts.getActiveSeason,
            (arg, t) => [arg(includeUnlaunched, t.Optional(t.Bool))],
            null
          );
          if (!ret) return null;

          const bounties: BountyInfo[] = [];
          for (const id in ret.bounties) {
            bounties.push(parseBountyInfo(ret.bounties[id]));
          }
          return {
            seasonId: ret.seasonID ?? undefined,
            endDate: parseInt(ret.endDate ?? 0),
            referralThreshold: parseInt(ret.referralThreshold ?? -1),
            bounties,
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
         * Get missions
         * @param missions
         */
        async getMissionsDetail(
          missions: BountyIdentifier[]
        ): Promise<BountyInfo[]> {
          const result = await executeScript(
            cadence.scripts.getBountiesDetail,
            (arg, t) => [
              arg(
                missions.map((one) => one.key),
                t.Array(t.String)
              ),
            ],
            []
          );
          if (missions.length !== result?.length) {
            throw new Error("Result invalid");
          }
          return result.map((one: any) => parseBountyInfo(one));
        },
        /**
         * get simple bounty info
         * @param id
         */
        async getBountyById(id: string): Promise<BountyInfo> {
          const result = await executeScript(
            cadence.scripts.getBountyById,
            (arg, t) => [arg(id, t.UInt64)],
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
        async getBountyByKey(key: string): Promise<BountyInfo> {
          const result = await executeScript(
            cadence.scripts.getBountiesDetail,
            (arg, t) => [arg([key], t.Array(t.String))],
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
          address: string | null = null,
          isPermanent = true
        ): Promise<RankingStatus | null> {
          const result = await executeScript(
            cadence.scripts.getRankingStatus,
            (arg, t) => [
              arg(isPermanent, t.Bool),
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
        async getAdminStatus(
          address: string
        ): Promise<AdminStatus | undefined> {
          return await executeScript(
            cadence.scripts.getAdminStatus,
            (arg, t) => [arg(address, t.Address)],
            undefined
          );
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
         * get mission status
         */
        async profileGetMissionStatus(
          acct: string,
          key: string
        ): Promise<MissionStatus | null> {
          return await executeScript(
            cadence.scripts.profileGetMissionStatus,
            (arg, t) => [arg(acct, t.Address), arg(key, t.String)],
            null
          );
        },
        /**
         * get bounty completed
         */
        async profileIsBountyCompleted(
          acct: string,
          bountyId: string
        ): Promise<boolean> {
          return await executeScript(
            cadence.scripts.profileIsBountyCompleted,
            (arg, t) => [arg(acct, t.Address), arg(bountyId, t.UInt64)],
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
        async loadProfileProfileRecord(
          acct: string
        ): Promise<ProfileRecord | undefined> {
          const result = await executeScript(
            cadence.scripts.profileGetProfileRecord,
            (arg, t) => [arg(acct, t.Address)],
            undefined
          );
          if (!result) return result;
          return parseProfileProfileRecord(result);
        },
        // Spaces
        /**
         * get all community
         */
        async spaceGetAll(): Promise<CommunitySpaceBasics[]> {
          return await executeScript(
            cadence.scripts.spaceGetAll,
            (arg, t) => [],
            []
          );
        },
        /**
         * Get community space basics
         * @param communityId
         */
        async spaceGetBasics(
          key: string
        ): Promise<CommunitySpaceBasics | null> {
          if (isNaN(parseInt(key))) {
            return await executeScript(
              cadence.scripts.spaceGetBasicsByKey,
              (arg, t) => [arg(key, t.String)],
              null
            );
          } else {
            return await executeScript(
              cadence.scripts.spaceGetBasics,
              (arg, t) => [arg(key, t.UInt64)],
              null
            );
          }
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
              arg(opt?.page ? String(opt?.page) : null, t.Optional(t.Int)),
              arg(opt?.limit ? String(opt?.limit) : null, t.Optional(t.Int)),
            ],
            []
          );
          if (!result || result.length === 0) {
            return [];
          }
          return result.map((one: any) => parseQuestInfo(one));
        },
        /**
         * get quest detail
         * @param communityKey
         * @param questKey
         */
        async spaceGetQuestDetail(
          communityKey: string,
          questKey: string
        ): Promise<QuestConfigDetail | null> {
          const result = await executeScript(
            cadence.scripts.spaceGetQuestDetail,
            (arg, t) => [arg(communityKey, t.String), arg(questKey, t.String)],
            null
          );
          if (!result) return result;
          return parseQuestInfoDetail(result);
        },
        /**
         * get mission list
         * @param communityKey
         */
        async spaceGetMissionList(
          communityKey: string,
          opt?: ListReqOption
        ): Promise<MissionConfig[]> {
          const result = await executeScript(
            cadence.scripts.spaceGetMissionList,
            (arg, t) => [
              arg(communityKey, t.String),
              arg(opt?.page ? String(opt?.page) : null, t.Optional(t.Int)),
              arg(opt?.limit ? String(opt?.limit) : null, t.Optional(t.Int)),
            ],
            []
          );
          if (!result || result.length === 0) {
            return [];
          }
          return result.map((one: any) => parseMissionInfo(one));
        },
        /**
         * search missions by key
         * @param communityKey
         * @param searchKey
         */
        async spaceSearchMissions(
          communityKey: string,
          searchKey: string
        ): Promise<MissionConfig[]> {
          const result = await executeScript(
            cadence.scripts.spaceSearchMissions,
            (arg, t) => [arg(communityKey, t.String), arg(searchKey, t.String)],
            []
          );
          if (!result || result.length === 0) {
            return [];
          }
          return result.map((one: any) => parseMissionInfo(one));
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
         * init admin for valid address
         */
        async adminInitialize() {
          return await sendTransaction(
            cadence.transactions.adminInitialize,
            (arg, t) => []
          );
        },
        /**
         * new season
         */
        async adminNewSeason(endDateTimestamp: number, threshold: number) {
          return await sendTransaction(
            cadence.transactions.adminStartNewSeason,
            (arg, t) => [
              arg((endDateTimestamp / 1000).toFixed(1), t.UFix64),
              arg(threshold.toFixed(0), t.UInt64),
            ]
          );
        },
        /**
         * update end date of current season
         */
        async adminUpdateEndDate(endDateTimestamp: number) {
          return await sendTransaction(
            cadence.transactions.adminUpdateEndDate,
            (arg, t) => [arg((endDateTimestamp / 1000).toFixed(1), t.UFix64)]
          );
        },
        /**
         * add quests to season
         */
        async adminAddQuestToSeason(
          quest: QuestConfig,
          rewards: PointRewardInfo[]
        ) {
          // missions
          const data = quest.missions.reduce(
            (prev, curr, index) => {
              prev.communities.push(curr.communityId);
              prev.keys.push(curr.key);
              prev.categories.push("0");
              prev.rewardPoints.push(rewards[index].rewardPoints.toFixed(0));
              prev.referralPoints.push(rewards[index].referalPoints.toFixed(0));
              prev.primary.push(false);
              return prev;
            },
            {
              communities: [] as string[],
              keys: [] as string[],
              categories: [] as string[],
              rewardPoints: [] as string[],
              referralPoints: [] as string[],
              primary: [] as boolean[],
            }
          );
          // quest
          data.communities.push(quest.communityId);
          data.keys.push(quest.key);
          data.categories.push("1");
          data.rewardPoints.push("0");
          data.referralPoints.push("0");
          data.primary.push(true);

          return await sendTransaction(
            cadence.transactions.adminAddBounties,
            (arg, t) => [
              arg(data.communities, t.Array(t.UInt64)),
              arg(data.keys, t.Array(t.String)),
              arg(data.categories, t.Array(t.UInt8)),
              arg(data.rewardPoints, t.Array(t.UInt64)),
              arg(data.referralPoints, t.Array(t.UInt64)),
              arg(data.primary, t.Array(t.Bool)),
            ]
          );
        },
        /**
         * Update bounty property
         */
        async adminBountyUpdateProperty(
          bountyId: string,
          property: string,
          value: boolean
        ) {
          return await sendTransaction(
            cadence.transactions.adminBountyUpdateProperty,
            (arg, t) => [
              arg(bountyId, t.UInt64),
              arg(property, t.UInt8),
              arg(value, t.Bool),
            ]
          );
        },
        async adminAddPrecondition(
          bountyId: string,
          options: UnlockConditions
        ) {
          let promise: Promise<string>;
          if (options.type === UnlockConditionTypes.MinimumPoint) {
            promise = sendTransaction(
              cadence.transactions.adminAddPreconditionMinimumPoint,
              (arg, t) => [
                arg(bountyId, t.UInt64),
                arg(options.amount, t.UInt64),
                arg(options.usePermanentPoint, t.Bool),
              ]
            );
          } else if (options.type === UnlockConditionTypes.FLOATRequired) {
            promise = sendTransaction(
              cadence.transactions.adminAddPreconditionFLOATRequired,
              (arg, t) => [
                arg(bountyId, t.UInt64),
                arg(options.host, t.Address),
                arg(options.eventId, t.UInt64),
              ]
            );
          } else if (options.type === UnlockConditionTypes.BountyCompleted) {
            promise = sendTransaction(
              cadence.transactions.adminAddPreconditionBountyCompleted,
              (arg, t) => [
                arg(bountyId, t.UInt64),
                arg(options.bountyId, t.UInt64),
              ]
            );
          } else {
            throw new Error("Unsupported type.");
          }
          return await promise;
        },
        async adminCreateFLOATinBounty(float: FLOATBasics, bountyId: string) {
          return await sendTransaction(
            cadence.transactions.adminCreateFLOATinBounty,
            (arg, t) => [
              arg(float.name, t.String),
              arg(float.description, t.String),
              arg(float.image, t.String),
              arg(float.url, t.String),
              arg(bountyId, t.UInt64),
            ]
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
         * add mission to a community space
         */
        async spaceAddMissions(
          spaceKey: string,
          missions: MissionConfigRequest[]
        ) {
          const data = missions.reduce(
            (prev, curr) => {
              prev.keys.push(curr.key);
              prev.titles.push(curr.name);
              prev.descs.push(curr.description);
              prev.images.push(curr.thumbnail ?? null);
              prev.steps.push(String(curr.steps));
              prev.stepCfgs.push(curr.stepsCfg);
              return prev;
            },
            {
              keys: [] as string[],
              titles: [] as string[],
              descs: [] as string[],
              images: [] as (string | null)[],
              steps: [] as string[],
              stepCfgs: [] as string[],
            }
          );
          return await sendTransaction(
            cadence.transactions.spaceAddMissions,
            (arg, t) => [
              arg(spaceKey, t.String),
              arg(data.keys, t.Array(t.String)),
              arg(data.titles, t.Array(t.String)),
              arg(data.descs, t.Array(t.String)),
              arg(data.images, t.Array(t.Optional(t.String))),
              arg(data.steps, t.Array(t.UInt64)),
              arg(data.stepCfgs, t.Array(t.String)),
            ]
          );
        },
        /**
         * Add quest to a community space
         */
        async spaceAddQuest(
          spaceKey: string,
          key: string,
          display: Display,
          existsMissionKeys: string[],
          newMissions: MissionConfigRequest[],
          achievement?: FLOATAchievement
        ) {
          const newMissionData = newMissions.reduce(
            (prev, curr) => {
              prev.keys.push(curr.key);
              prev.titles.push(curr.name);
              prev.descs.push(curr.description);
              prev.images.push(curr.thumbnail ?? null);
              prev.steps.push(String(curr.steps));
              prev.stepCfgs.push(curr.stepsCfg);
              return prev;
            },
            {
              keys: [] as string[],
              titles: [] as string[],
              descs: [] as string[],
              images: [] as (string | null)[],
              steps: [] as string[],
              stepCfgs: [] as string[],
            }
          );
          return await sendTransaction(
            cadence.transactions.spaceAddQuest,
            (arg, t) => [
              arg(spaceKey, t.String),
              arg(key, t.String),
              arg(display.name, t.String),
              arg(display.description, t.String),
              arg(display.thumbnail, t.String),
              // Mission
              arg(existsMissionKeys, t.Array(t.String)),
              arg(newMissionData.keys, t.Array(t.String)),
              arg(newMissionData.titles, t.Array(t.String)),
              arg(newMissionData.descs, t.Array(t.String)),
              arg(newMissionData.images, t.Array(t.Optional(t.String))),
              arg(newMissionData.steps, t.Array(t.UInt64)),
              arg(newMissionData.stepCfgs, t.Array(t.String)),
              // Achievement
              arg(achievement ? achievement.host : null, t.Optional(t.Address)),
              arg(
                achievement ? achievement.eventId : null,
                t.Optional(t.UInt64)
              ),
            ]
          );
        },
        async spaceApplyFLOATinQuest(
          float: FLOATBasics,
          communityKey: string,
          questKey: string
        ) {
          return await sendTransaction(
            cadence.transactions.spaceApplyFLOATinQuest,
            (arg, t) => [
              arg(float.name, t.String),
              arg(float.description, t.String),
              arg(float.image, t.String),
              arg(float.url, t.String),
              arg(communityKey, t.String),
              arg(questKey, t.String),
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
