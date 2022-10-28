import * as fcl from "@onflow/fcl";
import { replaceImportAddresses } from "./utils";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  const isMainnet = config.public.network === "mainnet";
  const appName = "Flow Challenge Tour";

  const kvMapping = {
    "flow.network": config.public.network,
    "accessNode.api": config.public.accessApi,
    "discovery.wallet": config.public.walletDiscovery,
    "app.detail.title": appName,
    "app.detail.icon": config.app.cdnURL + "/apple-touch-icon.png",
    "service.OpenID.scopes": "email email_verified name zoneinfo",
    "fcl.limit": 9999,
    "fcl.accountProof.resolver": async () => ({
      appIdentifier: `${appName} App v1.0`,
      // TODO use random hex from server
      nonce: "75f8587e5bd5f9dcc9909d0dae1f0ac5814458b2ae129620502cb936fde7120a",
    }),
  };

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
      },
      true
    );

  // initialize fcl
  for (const key in kvMapping) {
    const element = kvMapping[key];
    fcl.config().put(key, element);
    if (typeof element === "string") {
      console.log(`[${appName}] Flow config[${key}]: ${element}`);
    }
  }

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
