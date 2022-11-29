import Signer from "./signer.mjs";

export async function txCtrlerAppendQuestParams(
  signer: Signer,
  opts: OptionCtrlerAppendQuestParams
) {
  const params: { key: string; value: string }[] = [];
  for (const key in opts.params) {
    params.push({ key, value: opts.params[key] });
  }
  return signer.sendTransaction(
    await useStorage().getItem(
      "assets/server/cadence/transactions/ctrler-append-quest-params.cdc"
    ),
    (arg, t) => [
      arg(opts.target, t.String),
      arg(opts.questKey, t.String),
      arg(params, t.Dictionary({ key: t.String, value: t.String })),
    ]
  );
}

export async function txCtrlerSetQuestCompleted(
  signer: Signer,
  opts: OptionCtrlerSetQuestCompleted
) {
  const kvpair: { key: string; value: string }[] = [];
  if (opts.params) {
    for (const key in opts.params) {
      kvpair.push({ key, value: opts.params[key] });
    }
  }
  return signer.sendTransaction(
    await useStorage().getItem(
      "assets/server/cadence/transactions/ctrler-set-quest-completed.cdc"
    ),
    (arg, t) => [
      arg(opts.target, t.Address),
      arg(opts.questKey, t.String),
      arg(kvpair, t.Dictionary({ key: t.String, value: t.String })),
    ]
  );
}

export async function txCtrlerSetQuestFailure(
  signer: Signer,
  opts: OptionCtrlerSetQuestFailure
) {
  const kvpair: { key: string; value: string }[] = [];
  if (opts.params) {
    for (const key in opts.params) {
      kvpair.push({ key, value: opts.params[key] });
    }
  }
  return signer.sendTransaction(
    await useStorage().getItem(
      "assets/server/cadence/transactions/ctrler-set-quest-failure.cdc"
    ),
    (arg, t) => [
      arg(opts.target, t.Address),
      arg(opts.questKey, t.String),
      arg(kvpair, t.Dictionary({ key: t.String, value: t.String })),
    ]
  );
}

export async function txCtrlerSetupReferralCode(
  signer: Signer,
  opts: OptionCtrlerSetupReferralCode
) {
  return signer.sendTransaction(
    await useStorage().getItem(
      "assets/server/cadence/transactions/ctrler-setup-referral-code.cdc"
    ),
    (arg, t) => [arg(opts.target, t.String)]
  );
}

export async function scVerifyQuest(
  signer: Signer,
  questKey: string,
  params: { [key: string]: string }
): Promise<boolean> {
  const code = await useStorage().getItem(
    `assets/server/cadence/quests/${questKey}/verify-script.cdc`
  );
  const schema = await useStorage().getItem(
    `assets/server/json/quests/${questKey}/schema.json`
  );
  if (typeof code !== "string" || typeof schema !== "object") {
    throw new Error("Unknown quests key.");
  }
  const result = await signer.executeScript(
    code,
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
      return (schema as QuestSchema[]).map((one) => {
        if (typeof params[one.key] === "undefined") {
          throw new Error(`Missing parameters: ${one.key}`);
        }
        if (typeof typeMapping[one.type] === "undefined") {
          throw new Error(`Missing types: ${one.type}`);
        }
        console.log(`Params[${params[one.key]}] <- ${one.type}`);
        return arg(params[one.key], typeMapping[one.type] as typeof t);
      });
    },
    false
  );
  return !!result;
}
