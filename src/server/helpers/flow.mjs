import * as fcl from "@onflow/fcl";

// FCL_REGISTRY Hacking
const root =
  (typeof self === "object" && self.self === self && self) ||
  (typeof global === "object" && global.global === global && global) ||
  (typeof window === "object" && window.window === window && window);

root.FCL_REGISTRY = root.FCL_REGISTRY == null ? {} : root.FCL_REGISTRY;

if (root.FCL_REGISTRY?.config !== undefined) {
  root.FCL_REGISTRY.config?.subs?.clear()
}

export const APP_IDENTIFIER = "Flow Dev Quest V1.0";

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

// export function switchToEmulator() {
//   fcl
//     .config()
//     .put("fcl.limit", 9999)
//     .put("flow.network", "emulator")
//     .put("accessNode.api", "http://localhost:8888");
// }
