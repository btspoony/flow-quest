interface OptionAccountProof {
  address: string;
  proofNonce: string;
  proofSigs: {
    keyId: number;
    addr: string;
    signature: string;
  }[];
}

interface OptionProfileRegister {
  referredFrom?: string;
}

interface OptionCtrlerSetQuestAnswer {
  target: string;
  questKey: string;
  step: number;
  params: { [key: string]: string };
}

interface OptionCtlerCompleteBounty {
  target: string;
  bountyId: string;
}

interface ResponseBasics {
  ok: boolean;
  error?: {
    code: string;
    message: string;
  };
}

interface ResponseVerifyQuest extends ResponseBasics {
  isAccountValid?: boolean;
  isQuestValid?: boolean;
  transactionId?: string;
}

interface ResponseCompleteBounty extends ResponseBasics {
  isAccountValid?: boolean;
  isBountyCompleted?: boolean;
  transactionId?: string;
}

interface ResponseReferralCodeGenerate extends ResponseBasics {
  isAccountValid?: boolean;
  isPointsEnough?: boolean;
  transactionId?: string;
}
