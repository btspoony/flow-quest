import fs from "fs";
import path from "path";

import * as utils from "./helpers/utils.mjs";

async function main() {
  const signer = utils.buildSigner();

  // load data
  const data = JSON.parse(
    fs.readFileSync(
      path.resolve(process.cwd(), process.env.DATA_COMMUNITY_ADD_CHALLENGE),
      "utf8"
    )
  );

  const code = fs.readFileSync(
    path.join(
      process.cwd(),
      "cadence/dev-challenge/transactions/community-add-challenge.cdc"
    ),
    "utf8"
  );

  const txid = await signer.sendTransaction(code, (arg, t) => [
    arg(data.community, t.String),
    arg(data.key, t.String),
    arg(data.title, t.String),
    arg(data.description, t.String),
    arg(data.image, t.String),
    arg(data.questKeys, t.Array(t.String)),
    arg(data.achievementHost, t.Optional(t.Address)),
    arg(data.achievementId, t.Optional(t.UInt64)),
  ]);

  await utils.watchTransaction(signer, txid);
}
main();
