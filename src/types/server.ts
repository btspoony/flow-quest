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

interface OptionCtrlerSetMissionAnswer {
  target: string;
  missionKey: string;
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

interface ResponseVerifyMission extends ResponseBasics {
  isAccountValid?: boolean;
  isMissionValid?: boolean;
  transactionId?: string | null;
}

interface ResponseCompleteBounty extends ResponseBasics {
  isAccountValid?: boolean;
  isBountyCompleted?: boolean;
  transactionId?: string | null;
}

interface ResponseReferralCodeGenerate extends ResponseBasics {
  isAccountValid?: boolean;
  isPointsEnough?: boolean;
  transactionId?: string | null;
}
