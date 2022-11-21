import * as fcl from "@onflow/fcl";
import { flow, assert, Signer } from "../helpers";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const body = await readBody(event);

  // Step.0 verify body parameters
  // FIXME: params
  const mainnetAddress = body.address; // required, mainnet address
  const mainnetProofNonce = body.proofNonce; // required, mainnet account proof nonce
  const mainnetProofSigs = body.proofSigs; // required, mainnet account proof sigs
  const questId = body.questId; // required, quest id
  const questAddress = body.questAddr; // required, quest related
  const questTransaction = body.questTrx; // optional, quest related transaction

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

  const isValid = await fcl.AppUtils.verifyAccountProof(
    flow.APP_IDENTIFIER,
    {
      address: mainnetAddress,
      nonce: mainnetProofNonce,
      signatures: mainnetProofSigs,
    },
    {
      // use blocto adddres to avoid self-custodian
      // https://docs.blocto.app/blocto-sdk/javascript-sdk/flow/account-proof
      fclCryptoContract: isProduction
        ? "0xdb6b70764af4ff68"
        : "0x5b250a8a85b44a67",
    }
  );
  assert(isValid, "mainnet account proof invalid");

  // Step.2 Verify the quest result on testnet
  if (isProduction) {
    flow.switchToTestnet();
  } else {
    flow.switchToEmulator();
  }
  // TODO: run a script to ensure transactions

  // Step.3 Run a transaction on mainnet
  if (isProduction) {
    flow.switchToMainnet();
  } else {
    flow.switchToTestnet();
  }
  // TODO: run the reward transaction

  // Step.4 Return the transaction id
  return { ok: true };
});
