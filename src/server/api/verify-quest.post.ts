import { z, useValidatedBody } from "h3-zod";
import { flow, actions, utils } from "../helpers";
import { executeOrLoadFromRedis } from "../helpers/redis";

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

  console.log(`Request<VerifyQuest>[${body.address}] - Step.0: Body verified`);

  const isProduction = config.public.network === "mainnet";

  const signer = await utils.pickOneSigner();
  const isAccountValid = await utils.verifyAccountProof(body);

  let isQuestValid = false;
  let transactionId: string | null = null;

  if (isAccountValid) {
    console.log(
      `Request<VerifyQuest>[${body.address}] - Step.1: Signature verified`
    );

    if (isProduction) {
      flow.switchToMainnet();
    } else {
      flow.switchToTestnet();
    }

    const questDetail = await executeOrLoadFromRedis<QuestDetail>(
      `QuestDetail:${body.communityId}:${body.questKey}`,
      actions.scGetQuestDetail(signer, body.communityId, body.questKey)
    );

    if (
      typeof questDetail?.stepsCfg !== "string" ||
      !questDetail?.stepsCfg.startsWith("http")
    ) {
      throw new Error("Invalid quest detail.");
    }

    const stepsCfg = await executeOrLoadFromRedis<QuestStepsConfig[]>(
      `QuestStepsConfig:${questDetail?.stepsCfg}`,
      (async (): Promise<QuestStepsConfig[]> =>
        JSON.parse((await $fetch(questDetail?.stepsCfg)) as string))()
    );

    const stepCfg = stepsCfg[body.step];
    if (!stepCfg) throw new Error("Missing step Cfg");
    console.log(
      `Request<VerifyQuest>[${body.address}] - Step.2-1: loaded cfg from ${questDetail?.stepsCfg}`
    );

    // Step.2 Verify the quest result on testnet
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

    // run a script to ensure transactions
    const params: { [key: string]: string } = {};
    for (const one of body.questParams) {
      params[one.key] = one.value;
    }
    const result = await actions.scVerifyQuest(signer, stepCfg, params);
    console.log(
      `Request<VerifyQuest>[${body.address}] - Step.2-2: Quest result: ${result}, expect: ${stepCfg.test.expect}=${stepCfg.test.result}`
    );
    isQuestValid = result === stepCfg.test.result;

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
        `Request<VerifyQuest>[${body.address}] - Step.3: Transaction Sent: ${transactionId}`
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
