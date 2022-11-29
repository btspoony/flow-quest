interface OptionProfileRegister {
  referredFrom?: string;
}

interface OptionCtrlerAppendQuestParams {
  target: string;
  questKey: string;
  params: { [key: string]: string };
}

interface OptionCtrlerSetQuestCompleted {
  target: string;
  questKey: string;
  params: { [key: string]: string };
}

interface OptionCtrlerSetQuestFailure {
  target: string;
  questKey: string;
  params: { [key: string]: string };
}

interface OptionCtrlerSetupReferralCode {
  target: string;
}

interface QuestSchema {
  key: string;
  type: string;
}
