import * as fcl from "@onflow/fcl";
import { z, useValidatedBody } from "h3-zod";
import { flow, actions, Signer } from "../helpers";

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
      // required, quest identifier
      bountyId: z.string(),
    })
  );

  console.log(
    `Request<Complete Bounty>[${body.address}] - Step.0: Body verified`
  );

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

  let isBountyCompleted = false;
  let transactionId: string | null = null;

  if (isAccountValid) {
    console.log(
      `Request<Complete Bounty>[${body.address}] - Step.1: Signature verified`
    );

    // Step.2 Verify the quest result on testnet
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
