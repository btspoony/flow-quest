import { z, useValidatedBody } from "h3-zod";
import { flow, actions, utils } from "../helpers";

export default defineEventHandler<ResponseReferralCodeGenerate>(async function (
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
    })
  );

  console.log(
    `Request<Gene Referral Code>[${body.address}] - Step.0: Body verified`
  );

  const signer = await utils.pickOneSigner();
  const isAccountValid = await utils.verifyAccountProof(body);

  let isPointsEnough = false;
  let transactionId: string | null = null;

  if (isAccountValid) {
    console.log(
      `Request<Gene Referral Code>[${body.address}] - Step.1: Signature verified`
    );

    if (config.public.network === "mainnet") {
      flow.switchToMainnet();
    } else {
      flow.switchToTestnet();
    }

    isPointsEnough = await actions.scCheckPointsToGeneReferralCode(
      signer,
      body.address
    );

    if (isPointsEnough) {
      // run the reward transaction
      transactionId = await actions.txCtrlerSetupReferralCode(
        signer,
        body.address
      );
    }

    if (transactionId) {
      console.log(
        `Request<Gene Referral Code>[${body.address}] - Step.3: Transaction Sent: ${transactionId}`
      );
    }
  }

  return {
    ok: isAccountValid && isPointsEnough && transactionId !== null,
    isAccountValid,
    isPointsEnough,
    transactionId,
  };
});
