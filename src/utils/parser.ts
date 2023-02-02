export function parseProfileProfileRecord(record: any): ProfileRecord {
  const seasonPoints: { [key: string]: number } = {};
  const pointsInfo = record.seasonPoints || {};
  for (const key in pointsInfo) {
    if (typeof pointsInfo[key] === "string") {
      seasonPoints[key] = parseInt(pointsInfo[key]);
    }
  }
  return {
    points: parseInt(record.points),
    seasonPoints: seasonPoints,
    referredFromAddress: record.referredFromAddress,
    referralCode: record.referralCode,
    bountiesCompleted: record.bountiesCompleted,
    missionScores: record.missionScores,
  };
}

export function parseDisplay(display: any): Display {
  return {
    name: display.name,
    description: display.description,
    thumbnail: display.thumbnail.url,
  };
}

export function parseMissionInfo(info: any): MissionConfig {
  return {
    category: parseIdentifierCategory(info.identifier.category),
    communityId: info.identifier.communityId,
    key: info.identifier.key,
    display: parseDisplay(info.display),
    steps: parseInt((info.missionDetail ?? info.detail)?.steps ?? 0),
    stepsCfg: (info.missionDetail ?? info.detail)?.stepsCfg,
  };
}

export function parseQuestInfo(info: any): QuestConfig {
  return {
    category: parseIdentifierCategory(info.identifier.category),
    communityId: info.identifier.communityId,
    key: info.identifier.key,
    display: parseDisplay(info.display),
    missions:
      (info.questDetail ?? info.detail)?.missions?.map((mission: any) =>
        parseIdentifier(mission)
      ) ?? [],
    achievement: (info.questDetail ?? info.detail)?.achievement,
  };
}

export function parseQuestInfoDetail(info: any): QuestConfigDetail {
  return {
    owner: info.owner,
    quest: parseQuestInfo(info.quest),
    missions: (info.missions ?? []).map((mission: any) =>
      parseMissionInfo(mission)
    ),
  };
}

export function parseBountyInfo(info: any): BountyInfo {
  const category = parseIdentifierCategory(info.identifier.category);
  return {
    id: info.id,
    config:
      category === "quest" ? parseQuestInfo(info) : parseMissionInfo(info),
    preconditions: (info.preconditions ?? []).map((one: any) => {
      const cloned = Object.assign({}, one);
      if (typeof cloned.amount === "string")
        cloned.amount = parseInt(cloned.amount);
      if (typeof cloned.type === "string")
        cloned.type = parseInt(cloned.type) as UnlockConditionTypes;
      return cloned;
    }),
    properties: parseBountyProperties(info.properties),
    participants: info.participants,
    participantAmt: parseInt(info.participantAmt),
    rewardType: parseRewardType(info.rewardType),
    pointReward: info.pointReward
      ? {
          rewardType: parseRewardType(info.pointReward.type),
          rewardPoints: parseInt(info.pointReward.rewardPoints),
          referalPoints: parseInt(info.pointReward.referralPoints),
        }
      : undefined,
    floatReward: info.floatReward
      ? {
          rewardType: parseRewardType(info.floatReward.type),
          eventHost: info.floatReward.eventIdentifier.host,
          eventId: info.floatReward.eventIdentifier.eventId,
        }
      : undefined,
  };
}

export function parseBountyProperties(properties: any): BountyProperties {
  return {
    Launched: !!properties["0"],
    Featured: !!properties["1"],
  };
}

export function parseIdentifier(identifier: any): BountyIdentifier {
  return {
    category: parseIdentifierCategory(identifier.category),
    communityId: identifier.communityId,
    key: identifier.key,
  };
}

export function parseIdentifierCategory({ rawValue }: EnumData): BountyType {
  return rawValue === "0" ? "mission" : "quest";
}

export function parseRewardType({ rawValue }: EnumData): MissionRewardType {
  return rawValue === "0" ? "Points" : rawValue === "1" ? "FLOAT" : "None";
}
