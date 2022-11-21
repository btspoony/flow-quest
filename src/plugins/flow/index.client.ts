import * as fcl from "@onflow/fcl";
import { replaceImportAddresses } from "./utils";

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
    .put("app.detail.icon", config.app.cdnURL + "/apple-touch-icon.png")
    .put("service.OpenID.scopes", "email email_verified name zoneinfo")
    .put("fcl.limit", 9999)
    .put("fcl.accountProof.resolver", $fetch("/api/app-nonce"));
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
