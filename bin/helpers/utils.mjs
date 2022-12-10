import env from "dotenv";
import * as flow from "../../src/server/helpers/flow.mjs";
import Signer from "../../src/server/helpers/signer.mjs";

env.config();

export function buildSigner() {
  const adminAddress = process.env.NUXT_FLOW_ADMIN_ADDRESS;
  const privateKey = process.env.NUXT_FLOW_PRIVATE_KEY;
  const serviceAddress = process.env.NUXT_FLOW_SERVICE_ADDRESS;
  if (!adminAddress || !privateKey || !serviceAddress) {
    throw new Error("Missing env");
  }
  const isMainnet = process.env.NUXT_PUBLIC_NETWORK === "mainnet";
  if (isMainnet) {
    flow.switchToMainnet();
  } else {
    flow.switchToTestnet();
  }

  const keyIndex = 0;
  const signer = new Signer(adminAddress, privateKey, keyIndex, {
    Interfaces: serviceAddress,
    Helper: serviceAddress,
    UserProfile: serviceAddress,
    FLOATVerifiers: serviceAddress,
    Community: serviceAddress,
    BountyUnlockConditions: serviceAddress,
    CompetitionService: serviceAddress,
  });
  return signer;
}

/**
 * @param {Signer} signer
 * @param {String} txid
 */
export async function watchTransaction(signer, txid) {
  if (!txid) return;

  await new Promise((resolve, reject) => {
    signer.watchTransaction(
      txid,
      (txid, errMsg) => {
        if (errMsg) {
          console.log("TxError: ", errMsg);
        } else {
          console.log(`TxSealed: ${txid}`);
          resolve();
        }
      },
      (code) => {
        console.log(`TxUpdated: ${txid} - code(${code})`);
      },
      (errorMsg) => {
        console.log("UnknownError: ", errorMsg);
      }
    );
  });
}
