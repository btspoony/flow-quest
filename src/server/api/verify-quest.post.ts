import * as fcl from "@onflow/fcl";
import { z, useValidatedBody } from "h3-zod";
import { flow, actions, Signer } from "../helpers";

export default defineEventHandler<ResponseVerifyQuest>(async function (event) {
  const config = useRuntimeConfig();

  // Step.0 verify body parameters
  const body = await useValidatedBody(
    event,
    z.object({
      address: z.string(), // required, mainnet address
      proofNonce: z.string(), // required, mainnet account proof nonce
      proofSigs: z.array(
        // required, proof signatures
        z.object({
          keyId: z.number(),
          addr: z.string(),
          signature: z.string(),
        })
      ),
      // required, quest identifier
      communityId: z.string(),
      questKey: z.string(),
      // required, quest answer related
      step: z.number(),
      questParams: z.array(
        z.object({
          key: z.string(),
          value: z.string(),
        })
      ),
    })
  );

  console.log(`Request[${body.address}] - Step.0: Body verified`);

  const isProduction = config.public.network === "mainnet";

  // FIXME: using index pool
  const keyIndex = 0;
  const signer = new Signer(
    config.flowAdminAddress,
    config.flowPrivateKey,
    keyIndex,
    {
      Interfaces: config.public.flowServiceAddress,
      Helper: config.public.flowServiceAddress,
      QueryStructs: config.public.flowServiceAddress,
      UserProfile: config.public.flowServiceAddress,
      FLOATVerifiers: config.public.flowServiceAddress,
      Community: config.public.flowServiceAddress,
      BountyUnlockConditions: config.public.flowServiceAddress,
      CompetitionService: config.public.flowServiceAddress,
    }
  );

  // Step.1 Verify account proof on mainnet
  if (isProduction) {
    flow.switchToMainnet();
  } else {
    flow.switchToTestnet();
  }

  const isAccountValid = await fcl.AppUtils.verifyAccountProof(
    flow.APP_IDENTIFIER,
    {
      address: body.address,
      nonce: body.proofNonce,
      signatures: body.proofSigs.map((one) => ({
        f_type: "CompositeSignature",
        f_vsn: "1.0.0",
        keyId: one.keyId,
        addr: one.addr,
        signature: one.signature,
      })),
    },
    {
      // use blocto adddres to avoid self-custodian
      // https://docs.blocto.app/blocto-sdk/javascript-sdk/flow/account-proof
      fclCryptoContract: isProduction
        ? "0xdb6b70764af4ff68"
        : "0x5b250a8a85b44a67",
    }
  );

  let isQuestValid = false;
  let transactionId: string | null = null;

  if (isAccountValid) {
    console.log(`Request[${body.address}] - Step.1: Signature verified`);

    const questDetail = await actions.scGetQuestDetail(
      signer,
      body.communityId,
      body.questKey
    );

    if (
      typeof questDetail?.stepsCfg !== "string" ||
      !questDetail?.stepsCfg.startsWith("http")
    ) {
      throw new Error("Invalid quest detail.");
    }
    const stepsCfg: QuestStepsConfig[] = JSON.parse(
      (await $fetch(questDetail?.stepsCfg)) ?? {}
    );
    const stepCfg = stepsCfg[body.step];
    if (!stepCfg) throw new Error("Missing step Cfg");
    console.log(
      `Request[${body.address}] - Step.2-1: loaded cfg from ${questDetail?.stepsCfg}`
    );

    // Step.2 Verify the quest result on testnet
    if (isProduction) {
      flow.switchToTestnet();
    } else {
      flow.switchToEmulator();
    }
    // run a script to ensure transactions
    const params: { [key: string]: string } = {};
    for (const one of body.questParams) {
      params[one.key] = one.value;
    }
    isQuestValid = await actions.scVerifyQuest(signer, stepCfg, params);
    console.log(
      `Request[${body.address}] - Step.2-2: Quest verification: ${isQuestValid}`
    );

    // Step.3 Run a transaction on mainnet
    if (isProduction) {
      flow.switchToMainnet();
    } else {
      flow.switchToTestnet();
    }

    if (isQuestValid) {
      // run the reward transaction
      transactionId = await actions.txCtrlerSetQuestAnswer(signer, {
        target: body.address,
        questKey: body.questKey,
        step: body.step,
        params,
      });
    }

    if (transactionId) {
      console.log(
        `Request[${body.address}] - Step.3: Transaction Sent: ${transactionId}`
      );
    }
  }

  // Step.4 Return the transaction id
  return {
    ok: isAccountValid && isQuestValid && transactionId !== null,
    isAccountValid,
    isQuestValid,
    transactionId,
  };
});
