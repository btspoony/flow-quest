import * as fcl from "@onflow/fcl";
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
    // dApp address
    Interfaces: config.flowServiceAddress,
    Helper: config.flowServiceAddress,
    UserProfile: config.flowServiceAddress,
    FLOATVerifiers: config.flowServiceAddress,
    Community: config.flowServiceAddress,
    BountyUnlockConditions: config.flowServiceAddress,
    CompetitionService: config.flowServiceAddress,
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
      const queryResult = await fcl.query({
        cadence: replaceImportAddresses(code, addressMapping),
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
      fcl: fcl,
      scripts: {},
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
