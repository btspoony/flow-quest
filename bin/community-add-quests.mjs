import fs from "fs";
import path from "path";

import * as utils from "./helpers/utils.mjs";

async function main() {
  const signer = utils.buildSigner();

  // load data
  const data = JSON.parse(
    fs.readFileSync(
      path.resolve(process.cwd(), process.env.DATA_COMMUNITY_ADD_QUESTS),
      "utf8"
    )
  );

  const code = fs.readFileSync(
    path.join(
      process.cwd(),
      "cadence/dev-challenge/transactions/community-add-quests.cdc"
    ),
    "utf8"
  );

  const result = data.quests.reduce(
    (prev, curr) => {
      prev.keys.push(curr.key);
      prev.title.push(curr.title);
      prev.description.push(curr.description);
      prev.image.push(curr.image);
      prev.steps.push(curr.steps);
      prev.stepsCfg.push(curr.stepsCfg);
      prev.guideMD.push(curr.guideMD);
      return prev;
    },
    {
      keys: [],
      title: [],
      description: [],
      image: [],
      steps: [],
      stepsCfg: [],
      guideMD: [],
    }
  );

  const txid = await signer.sendTransaction(code, (arg, t) => [
    arg(data.community, t.String),
    arg(result.keys, t.Array(t.String)),
    arg(result.title, t.Array(t.String)),
    arg(result.description, t.Array(t.String)),
    arg(result.image, t.Array(t.Optional(t.String))),
    arg(result.steps, t.Array(t.UInt64)),
    arg(result.stepsCfg, t.Array(t.String)),
    arg(result.guideMD, t.Array(t.String)),
  ]);

  await utils.watchTransaction(signer, txid);
}
main();
