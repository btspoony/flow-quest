interface OptionProfileRegister {
  referredFrom?: string;
}

interface QuestConfig {
  questKey: string;
  rewardPoints: number;
  referalPoints?: number;
  stackable?: boolean;
  limitation?: number;
}

interface OptionAdminAddQuestConfig {
  seasonId: number;
  questCfg: QuestConfig;
}

interface OptionAdminStartNewSeason {
  endDate: number;
  questCfgs: QuestConfig[];
}

interface OptionAdminUpdateEndDate {
  seasonId: number;
  endDate: number;
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
