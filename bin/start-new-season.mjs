import fs from "fs";
import path from "path";
import env from "dotenv";
import * as flow from "../src/server/helpers/flow.mjs";
import Signer from "../src/server/helpers/signer.mjs";

env.config();

async function main() {
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
    UserProfile: serviceAddress,
    CompetitionService: serviceAddress,
  });

  // load data
  const seasonData = JSON.parse(
    fs.readFileSync(
      path.resolve(process.cwd(), process.env.DATA_SEASON_TO_START),
      "utf8"
    )
  );

  const code = fs.readFileSync(
    path.join(process.cwd(), "cadence/transactions/admin-start-new-season.cdc"),
    "utf8"
  );

  const txid = await signer.sendTransaction(code, (arg, t) => [
    arg(seasonData.endDate.toFixed(1), t.UFix64),
  ]);

  if (txid) {
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
}
main();
