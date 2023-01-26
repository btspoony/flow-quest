import { z, useValidatedBody } from "h3-zod";
import { flow, actions, utils } from "../helpers";
import { executeOrLoadFromRedis } from "../helpers/redis";

export default defineEventHandler<ResponseVerifyMission>(async function (
  event
) {
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
      // required, mission identifier
      communityId: z.string(),
      missionKey: z.string(),
      // required, mission answer related
      step: z.number(),
      questParams: z.array(
        z.object({
          key: z.string(),
          value: z.string(),
        })
      ),
    })
  );

  console.log(
    `Request<VerifyMission>[${body.address}] - Step.0: Body verified`
  );

  const isProduction = config.public.network === "mainnet";

  const signer = await utils.pickOneSigner();
  const isAccountValid = await utils.verifyAccountProof(body);

  let isMissionValid = false;
  let transactionId: string | null = null;

  if (isAccountValid) {
    console.log(
      `Request<VerifyMission>[${body.address}] - Step.1: Signature verified`
    );

    if (isProduction) {
      flow.switchToMainnet();
    } else {
      flow.switchToTestnet();
    }

    const missionDetail = await executeOrLoadFromRedis<MissionDetail>(
      `MissionDetail:${body.communityId}:${body.missionKey}`,
      actions.scGetMissionDetail(signer, body.communityId, body.missionKey)
    );

    if (
      typeof missionDetail?.stepsCfg !== "string" ||
      !missionDetail?.stepsCfg.startsWith("http")
    ) {
      throw new Error("Invalid mission detail.");
    }

    const stepsCfg = await executeOrLoadFromRedis<MissionDetailConfig>(
      `MissionStepsConfig:${missionDetail?.stepsCfg}`,
      (async (): Promise<MissionDetailConfig> => {
        const data = JSON.parse(
          (await $fetch(missionDetail?.stepsCfg)) as string
        );
        if (Array.isArray(data)) {
          return { steps: data };
        } else {
          return Object.assign({ steps: [] }, data);
        }
      })()
    );

    const stepCfg = stepsCfg.steps[body.step];
    if (!stepCfg) throw new Error("Missing step Cfg");
    console.log(
      `Request<VerifyMission>[${body.address}] - Step.2-1: loaded cfg from ${missionDetail?.stepsCfg}`
    );

    const params = body.questParams.reduce((prev, curr) => {
      prev[curr.key] = curr.value;
      return prev;
    }, {} as { [key: string]: string });

    // Step.2 run a script to ensure transactions
    isMissionValid = await actions.scVerifyMission(
      signer,
      stepCfg,
      body.questParams
    );

    // Step.3 Run a transaction on mainnet
    if (isProduction) {
      flow.switchToMainnet();
    } else {
      flow.switchToTestnet();
    }

    if (isMissionValid) {
      // run the reward transaction
      transactionId = await actions.txCtrlerSetMissionAnswer(signer, {
        target: body.address,
        missionKey: body.missionKey,
        step: body.step,
        params,
      });
    }

    if (transactionId) {
      console.log(
        `Request<VerifyMission>[${body.address}] - Step.3: Transaction Sent: ${transactionId}`
      );
    }
  }

  // Step.4 Return the transaction id
  return {
    ok: isAccountValid && isMissionValid && transactionId !== null,
    isAccountValid,
    isMissionValid,
    transactionId,
  };
});
