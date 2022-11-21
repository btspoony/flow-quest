import * as fcl from "@onflow/fcl";
import Signer from "./signer";
import cadence from "~/assets/cadence";

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

export async function txProfileRegister(
  signer: Signer,
  opts: OptionProfileRegister
) {
  return signer.sendTransaction(
    cadence.transactions.profileRegister,
    (arg, t) => [arg(opts.referredFrom, t.Optional(t.String))]
  );
}

export async function txAdminAddQuestConfig(
  signer: Signer,
  opts: OptionAdminAddQuestConfig
) {
  return signer.sendTransaction(
    cadence.transactions.adminAddQuestConfig,
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
    cadence.transactions.adminStartNewSeason,
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
    cadence.transactions.adminUpdateEndDate,
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
    cadence.transactions.ctrlerAppendQuestParams,
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
    cadence.transactions.ctrlerSetQuestCompleted,
    (arg, t) => [arg(opts.target, t.Address), arg(opts.questKey, t.String)]
  );
}

export async function txCtrlerSetQuestFailure(
  signer: Signer,
  opts: OptionCtrlerSetQuestFailure
) {
  return signer.sendTransaction(
    cadence.transactions.ctrlerSetQuestFailure,
    (arg, t) => [arg(opts.target, t.Address), arg(opts.questKey, t.String)]
  );
}

export async function txCtrlerSetupReferralCode(
  signer: Signer,
  opts: OptionCtrlerSetupReferralCode
) {
  return signer.sendTransaction(
    cadence.transactions.ctrlerSetupReferralCode,
    (arg, t) => [arg(opts.target, t.String)]
  );
}
