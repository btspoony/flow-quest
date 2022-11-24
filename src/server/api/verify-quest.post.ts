import * as fcl from "@onflow/fcl";
import { z, useValidatedBody } from "h3-zod";
import { flow, assert, Signer } from "../helpers";

export default defineEventHandler(async function (event) {
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
      questKey: z.string(), // required, quest id
      questParams: z.array(
        // required, quest related
        z.object({
          key: z.string(),
          value: z.string(),
        })
      ),
    })
  );

  console.log(`Request[${body.address}] - Step.0: Body verified`);

  const isProduction = config.public.network === "mainnet";

  const signer = new Signer(config.flowAdminAddress, config.flowPrivateKey, 0, {
    Interfaces: config.flowServiceAddress,
    UserProfile: config.flowServiceAddress,
    CompetitionService: config.flowServiceAddress,
  });

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
    isQuestValid = await flow.scVerifyQuest(signer, body.questKey, params);
    console.log(
      `Request[${body.address}] - Step.2: Quest verification: ${isQuestValid}`
    );

    // Step.3 Run a transaction on mainnet
    if (isProduction) {
      flow.switchToMainnet();
    } else {
      flow.switchToTestnet();
    }

    if (isQuestValid) {
      // run the reward transaction
      transactionId = await flow.txCtrlerSetQuestCompleted(signer, {
        target: body.address,
        questKey: body.questKey,
      });
    } else {
      transactionId = await flow.txCtrlerSetQuestFailure(signer, {
        target: body.address,
        questKey: body.questKey,
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
