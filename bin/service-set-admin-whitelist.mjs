import fs from "fs";
import path from "path";

import * as utils from "./helpers/utils.mjs";

async function main() {
  const signer = utils.buildSigner();

  const code = fs.readFileSync(
    path.join(
      process.cwd(),
      "cadence/dev-challenge/transactions/service-set-admin-whitelist.cdc"
    ),
    "utf8"
  );

  const txid = await signer.sendTransaction(code, (arg, t) => [
    arg(process.env.DATA_WHITELIST_ADDESS, t.Address),
    arg(true, t.Bool),
  ]);

  await utils.watchTransaction(signer, txid);
}
main();
