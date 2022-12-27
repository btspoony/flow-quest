import fs from "fs";
import path from "path";

import * as utils from "./helpers/utils.mjs";

async function main() {
  const signer = utils.buildSigner();

  const code = fs.readFileSync(
    path.join(process.cwd(), "cadence/utils/transactions/add-more-keys.cdc"),
    "utf8"
  );

  const txid = await signer.sendTransaction(code, (arg, t) => [
    arg("10", t.Int),
  ]);

  await utils.watchTransaction(signer, txid);
}
main();
