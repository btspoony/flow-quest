import fs from "fs";
import path from "path";

import * as utils from "./helpers/utils.mjs";

async function main() {
  const signer = utils.buildSigner();

  const code = fs.readFileSync(
    path.join(
      process.cwd(),
      "cadence/dev-challenge/transactions/admin-close-season.cdc"
    ),
    "utf8"
  );

  const now = Math.floor(Date.now() / 1000) + 30;
  const txid = await signer.sendTransaction(code, (arg, t) => [
    arg(now.toFixed(1), t.UFix64),
  ]);

  await utils.watchTransaction(signer, txid);
}
main();
