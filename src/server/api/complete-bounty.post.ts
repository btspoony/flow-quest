import { z, useValidatedBody } from "h3-zod";
import { flow, actions, utils } from "../helpers";

export default defineEventHandler<ResponseCompleteBounty>(async function (
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
      bountyId: z.string(),
    })
  );

  console.log(
    `Request<Complete Bounty>[${body.address}] - Step.0: Body verified`
  );

  const signer = utils.createSigner();
  const isAccountValid = await utils.verifyAccountProof(body);

  let isBountyCompleted = false;
  let transactionId: string | null = null;

  if (isAccountValid) {
    console.log(
      `Request<Complete Bounty>[${body.address}] - Step.1: Signature verified`
    );

    if (config.public.network === "mainnet") {
      flow.switchToMainnet();
    } else {
      flow.switchToTestnet();
    }

    // Step.2 Verify the mission result on testnet
    // Check to ensure bounty completed
    isBountyCompleted = await actions.scCheckBountyComplete(
      signer,
      body.address,
      body.bountyId
    );

    if (isBountyCompleted) {
      // run the reward transaction
      transactionId = await actions.txCompleteBounty(signer, {
        target: body.address,
        bountyId: body.bountyId,
      });
    }

    if (transactionId) {
      console.log(
        `Request<Complete Bounty>[${body.address}] - Step.3: Transaction Sent: ${transactionId}`
      );
    }
  }

  // Step.4 Return the transaction id
  return {
    ok: isAccountValid && isBountyCompleted && transactionId !== null,
    isAccountValid,
    isBountyCompleted,
    transactionId,
  };
});
