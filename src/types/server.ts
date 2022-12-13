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

interface OptionCtrlerSetupReferralCode {
  target: string;
}

interface ResponseVerifyQuest {
  ok: boolean;
  isAccountValid: boolean;
  isQuestValid: boolean;
  transactionId: string | null;
}

interface ResponseCompleteBounty {
  ok: boolean;
  isAccountValid: boolean;
  isBountyCompleted: boolean;
  transactionId: string | null;
}
