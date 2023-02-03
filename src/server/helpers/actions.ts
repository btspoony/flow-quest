import * as flow from "./flow.mjs";
import Signer from "./signer.mjs";
import * as fcl from "@onflow/fcl";
import {
  executeOrLoadFromRedis,
  acquireKeyIndex,
  releaseKeyIndex,
} from "./redis";

/// ------------------------------ Transactions ------------------------------

async function sendTransactionWithKeyPool(
  signer: Signer,
  code: string,
  args: fcl.ArgumentFunction
): Promise<string | null> {
  const keyIndex = await acquireKeyIndex(signer.address);
  const authz = signer.buildAuthorization({
    accountIndex: keyIndex,
  });
  const txid = await signer.sendTransaction(code, args, authz);
  // Not to watch
  // if (txid) {
  //   signer.onceTransactionSealed(txid, (tx) => {
  //     return releaseKeyIndex(signer.address, keyIndex);
  //   });
  // }
  return txid;
}

export async function txCtrlerSetMissionAnswer(
  signer: Signer,
  opts: OptionCtrlerSetMissionAnswer
) {
  const kvpair: { key: string; value: string }[] = [];
  if (opts.params) {
    for (const key in opts.params) {
      kvpair.push({ key, value: opts.params[key] });
    }
  }
  return sendTransactionWithKeyPool(
    signer,
    await useStorage().getItem(
      "assets/server/cadence/transactions/ctrler-set-mission-completed.cdc"
    ),
    (arg, t) => [
      arg(opts.target, t.Address),
      arg(opts.missionKey, t.String),
      arg(String(opts.step), t.Int),
      arg(kvpair, t.Dictionary({ key: t.String, value: t.String })),
    ]
  );
}

export async function txCompleteBounty(
  signer: Signer,
  opts: OptionCtlerCompleteBounty
) {
  return sendTransactionWithKeyPool(
    signer,
    await useStorage().getItem(
      "assets/server/cadence/transactions/ctrler-complete-bounty.cdc"
    ),
    (arg, t) => [arg(opts.target, t.Address), arg(opts.bountyId, t.UInt64)]
  );
}

export async function txCtrlerSetupReferralCode(
  signer: Signer,
  target: string
) {
  return sendTransactionWithKeyPool(
    signer,
    await useStorage().getItem(
      "assets/server/cadence/transactions/ctrler-setup-referral-code.cdc"
    ),
    (arg, t) => [arg(target, t.Address)]
  );
}

/// ------------------------------ Scripts ------------------------------

export async function scGetMissionDetail(
  signer: Signer,
  communityId: string,
  missionKey: string
): Promise<MissionDetail> {
  const code = await useStorage().getItem(
    `assets/server/cadence/scripts/get-mission-detail.cdc`
  );
  if (typeof code !== "string") {
    throw new Error("Unknown script.");
  }
  const result = await signer.executeScript(
    code,
    (arg, t) => [arg(communityId, t.UInt64), arg(missionKey, t.String)],
    undefined
  );
  if (!result) {
    throw new Error("Failed to executeScript");
  }
  return result;
}

export async function scCheckBountyComplete(
  signer: Signer,
  acct: string,
  bountyId: string
): Promise<boolean> {
  const code = await useStorage().getItem(
    `assets/server/cadence/scripts/check-bounty-complete.cdc`
  );
  if (typeof code !== "string") {
    throw new Error("Unknown script.");
  }
  return await signer.executeScript(
    code,
    (arg, t) => [arg(acct, t.Address), arg(bountyId, t.UInt64)],
    false
  );
}

export async function scCheckPointsToGeneReferralCode(
  signer: Signer,
  acct: string
): Promise<boolean> {
  const code = await useStorage().getItem(
    `assets/server/cadence/scripts/check-points-to-gene-referral.cdc`
  );
  if (typeof code !== "string") {
    throw new Error("Unknown script.");
  }
  return await signer.executeScript(
    code,
    (arg, t) => [arg(acct, t.Address)],
    false
  );
}

export async function scVerifyMission(
  signer: Signer,
  stepCfg: MissionStepsConfig,
  params: { key: string; value: string }[]
): Promise<boolean> {
  if (stepCfg.type === "onchain") {
    // Verify the mission result on testnet
    if (typeof stepCfg.test.network !== "string")
      throw new Error("Network is missing.");
    if (typeof stepCfg.test.expect !== "string")
      throw new Error("Expect is missing.");
    if (typeof stepCfg.test.result === "undefined")
      throw new Error("Result is missing.");

    if (stepCfg.test.network === "mainnet") {
      flow.switchToMainnet();
    } else {
      flow.switchToTestnet();
    }

    const code = await executeOrLoadFromRedis<string>(
      `MissionVerificationCode:${stepCfg.code}`,
      $fetch(stepCfg.code)
    );
    console.log(`[Loaded Code]: ${stepCfg.code}`);
    if (typeof code !== "string") {
      throw new Error("Unknown missions key.");
    }
    if (typeof stepCfg.schema !== "object") {
      throw new Error("Unknown schema.");
    }
    const paramsObj = params.reduce((prev, curr) => {
      prev[curr.key] = curr.value;
      return prev;
    }, {} as { [key: string]: string });

    const result = await signer.executeScript(
      params.reduce((prev, curr) => {
        return prev.replaceAll(`\{${curr.key}\}`, curr.value);
      }, code),
      (arg, t) => {
        // simple type mapping
        const typeMapping: { [key: string]: typeof t } = {
          // Basic
          Int: t.Int,
          UInt8: t.UInt8,
          UInt64: t.UInt64,
          UFix64: t.UFix64,
          Fix64: t.Fix64,
          Address: t.Address,
          String: t.String,
          Bool: t.Bool,
          // Optional
          "Optional(Int)": t.Optional(t.Int),
          "Optional(UInt8)": t.Optional(t.UInt8),
          "Optional(UInt64)": t.Optional(t.UInt64),
          "Optional(UFix64)": t.Optional(t.UFix64),
          "Optional(Fix64)": t.Optional(t.Fix64),
          "Optional(Address)": t.Optional(t.Address),
          "Optional(String)": t.Optional(t.String),
          "Optional(Bool)": t.Optional(t.Bool),
          // Array
          "Array(Int)": t.Array(t.Int),
          "Array(UInt8)": t.Array(t.UInt8),
          "Array(UInt64)": t.Array(t.UInt64),
          "Array(UFix64)": t.Array(t.UFix64),
          "Array(Fix64)": t.Array(t.Fix64),
          "Array(Address)": t.Array(t.Address),
          "Array(String)": t.Array(t.String),
          "Array(Bool)": t.Array(t.Bool),
          // Array + Optional
          "Array(Optional(Int))": t.Array(t.Optional(t.Int)),
          "Array(Optional(UInt8))": t.Array(t.Optional(t.UInt8)),
          "Array(Optional(UInt64))": t.Array(t.Optional(t.UInt64)),
          "Array(Optional(UFix64))": t.Array(t.Optional(t.UFix64)),
          "Array(Optional(Fix64))": t.Array(t.Optional(t.Fix64)),
          "Array(Optional(Address))": t.Array(t.Optional(t.Address)),
          "Array(Optional(String))": t.Array(t.Optional(t.String)),
          "Array(Optional(Bool))": t.Array(t.Optional(t.Bool)),
        };
        return stepCfg.schema.map((one) => {
          if (typeof paramsObj[one.key] === "undefined") {
            throw new Error(`Missing parameters: ${one.key}`);
          }
          if (typeof typeMapping[one.type] === "undefined") {
            throw new Error(`Missing types: ${one.type}`);
          }
          console.log(`Params[${paramsObj[one.key]}] <- ${one.type}`);
          return arg(paramsObj[one.key], typeMapping[one.type] as typeof t);
        });
      },
      false
    );
    console.log(
      `Request<VerifyMission> - Step.2-2: Mission result: ${result}, expect: ${stepCfg.test.expect}=${stepCfg.test.result}`
    );
    return result === stepCfg.test.result;
  } else {
    // Verify quiz
    if (!Array.isArray(stepCfg.quiz)) {
      throw new Error("Step config: quiz should be an array");
    }
    const answers = stepCfg.quiz
      .map((one) => one.answer)
      .filter((one) => typeof one === "string");
    if (answers.length !== params.length) {
      throw new Error(
        `Step Answers: answer amount is miss-match: ${answers.length} (expect ${params.length})`
      );
    }
    params.sort((a, b) => parseInt(a.key) - parseInt(b.key));
    let isValid = true;
    for (let i = 0; i < answers.length; i++) {
      isValid = isValid && answers[i] === params[i].value;
    }
    return isValid;
  }
}
