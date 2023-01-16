export function parseProfileSeasonRecord(record: any): SeasonRecord {
  return {
    seasonId: record.seasonId,
    points: parseInt(record.points),
    referredFromAddress: record.referredFromAddress,
    referralCode: record.referralCode,
    bountiesCompleted: record.bountiesCompleted,
    questScores: record.questScores,
  };
}

export function parseDisplay(display: any): Display {
  return {
    name: display.name,
    description: display.description,
    thumbnail: display.thumbnail.url,
  };
}

export function parseQuestInfo(info: any): QuestConfig {
  return {
    category: parseIdentifierCategory(info.identifier.category),
    communityId: info.identifier.communityId,
    key: info.identifier.key,
    display: parseDisplay(info.display),
    steps: parseInt((info.questDetail ?? info.detail)?.steps ?? 0),
    stepsCfg: (info.questDetail ?? info.detail)?.stepsCfg,
    guideMD: (info.questDetail ?? info.detail)?.guideMD,
  };
}

export function parseChallengeInfo(info: any): ChallengeConfig {
  return {
    category: parseIdentifierCategory(info.identifier.category),
    communityId: info.identifier.communityId,
    key: info.identifier.key,
    display: parseDisplay(info.display),
    quests:
      (info.challengeDetail ?? info.detail)?.quests?.map((quest: any) =>
        parseIdentifier(quest)
      ) ?? [],
    achievement: (info.challengeDetail ?? info.detail)?.achievement,
  };
}

export function parseChallengeInfoDetail(info: any): ChallengeConfigDetail {
  return {
    owner: info.owner,
    challenge: parseChallengeInfo(info.challenge),
    quests: (info.quests ?? []).map((quest: any) => parseQuestInfo(quest)),
  };
}

export function parseBountyInfo(info: any): BountyInfo {
  const category = parseIdentifierCategory(info.identifier.category);
  return {
    id: info.id,
    config:
      category === "challenge"
        ? parseChallengeInfo(info)
        : parseQuestInfo(info),
    preconditions: info.preconditions,
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
  return rawValue === "0" ? "quest" : "challenge";
}

export function parseRewardType({ rawValue }: EnumData): QuestRewardType {
  return rawValue === "0" ? "Points" : rawValue === "1" ? "FLOAT" : "None";
}
