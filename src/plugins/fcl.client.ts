import * as fcl from "@onflow/fcl";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  const isMainnet = config.public.network === "mainnet";
  const appName = "Flow Challenge Tour";

  // method of replace imports
  const replaceImports = (code: string) =>
    replaceImportAddresses(
      code,
      // Address mapping
      {
        MetadataViews: isMainnet ? "0x1d7e57aa55817448" : "0x631e88ae7f1d7c20",
        NonFungibleToken: isMainnet
          ? "0x1d7e57aa55817448"
          : "0x631e88ae7f1d7c20",
        FungibleToken: isMainnet ? "0xf233dcee88fe0abe" : "0x9a0766d93b6608b7",
        FlowToken: isMainnet ? "0x1654653399040a61" : "0x7e60df042a9c0868",
      }
    );

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
  // ------ Build scripts ------

  // ------ Build transactions ------

  return {
    provide: {
      appName: () => appName,
      fcl: fcl,
      scripts: {},
      transactions: {},
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
