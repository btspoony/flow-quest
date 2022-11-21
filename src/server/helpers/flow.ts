import * as fcl from "@onflow/fcl";
import Signer from "./signer";

export const APP_IDENTIFIER = "Flow Dev Challenge V1.0";

export function switchToMainnet() {
  fcl
    .config()
    .put("fcl.limit", 9999)
    .put("flow.network", "mainnet")
    .put("accessNode.api", "https://rest-mainnet.onflow.org");
}

export function switchToTestnet() {
  fcl
    .config()
    .put("fcl.limit", 9999)
    .put("flow.network", "testnet")
    .put("accessNode.api", "https://rest-testnet.onflow.org");
}

export function switchToEmulator() {
  fcl
    .config()
    .put("fcl.limit", 9999)
    .put("flow.network", "emulator")
    .put("accessNode.api", "http://localhost:8080");
}

export async function txAdminAddQuestConfig(
  signer: Signer,
  opts: OptionAdminAddQuestConfig
) {
  return signer.sendTransaction(
    await useStorage().getItem(
      "assets/server/cadence/transactions/admin-add-quest-cfg.cdc"
    ),
    (arg, t) => [
      arg(String(opts.seasonId), t.UInt64),
      arg(opts.questCfg.questKey, t.String),
      arg(String(opts.questCfg.rewardPoints), t.UInt64),
      arg(
        opts.questCfg.referalPoints
          ? String(opts.questCfg.referalPoints)
          : null,
        t.Optional(t.UInt64)
      ),
      arg(opts.questCfg.stackable, t.Optional(t.Bool)),
      arg(
        opts.questCfg.limitation ? String(opts.questCfg.limitation) : null,
        t.Optional(t.UInt64)
      ),
    ]
  );
}

export async function txAdminStartNewSeason(
  signer: Signer,
  opts: OptionAdminStartNewSeason
) {
  return signer.sendTransaction(
    await useStorage().getItem(
      "assets/server/cadence/transactions/admin-start-new-season.cdc"
    ),
    (arg, t) => [
      arg(opts.endDate, t.UFix64),
      arg(
        opts.questCfgs.map((o) => o.questKey),
        t.Array(t.String)
      ),
      arg(
        opts.questCfgs.map((o) => o.rewardPoints),
        t.Array(t.UInt64)
      ),
      arg(
        opts.questCfgs.map((o) =>
          o.referalPoints ? String(o.referalPoints) : null
        ),
        t.Array(t.Optional(t.UInt64))
      ),
      arg(
        opts.questCfgs.map((o) => o.stackable),
        t.Array(t.Optional(t.Bool))
      ),
      arg(
        opts.questCfgs.map((o) => (o.limitation ? String(o.limitation) : null)),
        t.Array(t.Optional(t.UInt64))
      ),
    ]
  );
}

export async function txAdminUpdateEndDate(
  signer: Signer,
  opts: OptionAdminUpdateEndDate
) {
  return signer.sendTransaction(
    await useStorage().getItem(
      "assets/server/cadence/transactions/admin-update-end-date.cdc"
    ),
    (arg, t) => [
      arg(String(opts.seasonId), t.UInt64),
      arg(String(opts.endDate), t.UFix64),
    ]
  );
}

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
  return signer.sendTransaction(
    await useStorage().getItem(
      "assets/server/cadence/transactions/ctrler-set-quest-completed.cdc"
    ),
    (arg, t) => [arg(opts.target, t.Address), arg(opts.questKey, t.String)]
  );
}

export async function txCtrlerSetQuestFailure(
  signer: Signer,
  opts: OptionCtrlerSetQuestFailure
) {
  return signer.sendTransaction(
    await useStorage().getItem(
      "assets/server/cadence/transactions/ctrler-set-quest-failure.cdc"
    ),
    (arg, t) => [arg(opts.target, t.Address), arg(opts.questKey, t.String)]
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
  argsFunc: fcl.ArgumentFunction
): Promise<boolean> {
  const code = await useStorage().getItem(
    `assets/server/cadence/quests/${questKey}/verify-script.cdc`
  );
  if (typeof code !== "string") {
    throw new Error("Unknown quests key.");
  }
  return signer.executeScript(code, argsFunc, false);
}
