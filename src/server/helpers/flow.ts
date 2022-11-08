import fcl from "@onflow/fcl";

export const appIdentifier = "Flow Dev Challenge V1.0";

export function switchToMainnet() {
  fcl
    .config()
    .put("fcl.limit", 9999)
    .put("flow.network", "mainnet")
    .put("accessNode.api", "https://rest-mainnet.onflow.org");
}

export function switchToTestnet() {
  fcl
    .config()
    .put("fcl.limit", 9999)
    .put("flow.network", "testnet")
    .put("accessNode.api", "https://rest-testnet.onflow.org");
}
