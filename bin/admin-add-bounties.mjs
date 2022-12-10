import fs from "fs";
import path from "path";

import * as utils from "./helpers/utils.mjs";

async function main() {
  const signer = utils.buildSigner();

  // load data
  const data = JSON.parse(
    fs.readFileSync(
      path.resolve(process.cwd(), process.env.DATA_SEASON_BOUNTIES),
      "utf8"
    )
  );

  const code = fs.readFileSync(
    path.join(
      process.cwd(),
      "cadence/dev-challenge/transactions/admin-add-bounties.cdc"
    ),
    "utf8"
  );

  const result = data.bounties.reduce(
    (prev, curr) => {
      prev.keys.push(curr.key);
      prev.categories.push(curr.category);
      prev.rewardPoints.push(curr.rewardPoints);
      prev.referralPoints.push(curr.referralPoints);
      prev.primary.push(curr.primary);
      return prev;
    },
    {
      keys: [],
      categories: [],
      rewardPoints: [],
      referralPoints: [],
      primary: [],
    }
  );

  const txid = await signer.sendTransaction(code, (arg, t) => [
    arg(data.community, t.String),
    arg(result.keys, t.Array(t.String)),
    arg(result.categories, t.Array(t.UInt8)),
    arg(result.rewardPoints, t.Array(t.UInt64)),
    arg(result.referralPoints, t.Array(t.UInt64)),
    arg(result.primary, t.Array(t.Bool)),
  ]);

  await utils.watchTransaction(signer, txid);
}
main();
