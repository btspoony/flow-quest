import fs from "fs";
import path from "path";

import * as utils from "./helpers/utils.mjs";

async function main() {
  const signer = utils.buildSigner();

  // load data
  const seasonData = JSON.parse(
    fs.readFileSync(
      path.resolve(process.cwd(), process.env.DATA_SEASON_TO_START),
      "utf8"
    )
  );

  const code = fs.readFileSync(
    path.join(
      process.cwd(),
      "cadence/dev-challenge/transactions/admin-start-new-season.cdc"
    ),
    "utf8"
  );

  const txid = await signer.sendTransaction(code, (arg, t) => [
    arg(seasonData.endDate.toFixed(1), t.UFix64),
  ]);

  await utils.watchTransaction(signer, txid);
}
main();
