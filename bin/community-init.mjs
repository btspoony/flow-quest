import fs from "fs";
import path from "path";

import * as utils from "./helpers/utils.mjs";

async function main() {
  const signer = utils.buildSigner();

  // load data
  const data = JSON.parse(
    fs.readFileSync(
      path.resolve(process.cwd(), process.env.DATA_COMMUNITY_INIT),
      "utf8"
    )
  );

  const code = fs.readFileSync(
    path.join(
      process.cwd(),
      "cadence/dev-challenge/transactions/community-create.cdc"
    ),
    "utf8"
  );

  const txid = await signer.sendTransaction(code, (arg, t) => [
    arg(data.key, t.String),
    arg(data.name, t.String),
    arg(data.description, t.String),
    arg(data.image, t.String),
    arg(data.banner, t.String),
    arg(data.twitter, t.String),
    arg(data.discord, t.String),
    arg(data.website, t.String),
  ]);

  await utils.watchTransaction(signer, txid);
}
main();
