import MetadataViews from "../deps/MetadataViews.cdc"
import Interfaces from "./Interfaces.cdc"
import Helper from "./Helper.cdc"

pub contract QueryStructs {

  pub struct BountyInfo {
    pub let id: UInt64
    pub let identifier: AnyStruct{Interfaces.BountyEntityIdentifier}
    pub let properties: {UInt8: Bool}
    pub let display: MetadataViews.Display
    pub let questDetail: Interfaces.QuestDetail?
    pub let challengeDetail: Interfaces.ChallengeDetail?
    // bounty data
    pub let preconditions: [AnyStruct{Interfaces.UnlockCondition}]
    pub let participants: {Address: {String: AnyStruct}}
    pub let participantAmt: UInt64
    // reward info
    pub let rewardType: Helper.QuestRewardType
    pub let pointReward: Helper.PointReward?
    pub let floatReward: Helper.FLOATReward?

    init(
      id: UInt64,
      identifier: AnyStruct{Interfaces.BountyEntityIdentifier},
      properties: {UInt8: Bool},
      display: MetadataViews.Display,
      questDetail: Interfaces.QuestDetail?,
      challengeDetail: Interfaces.ChallengeDetail?,
      preconditions: [AnyStruct{Interfaces.UnlockCondition}],
      participants: {Address: {String: AnyStruct}},
      participantAmt: UInt64,
      rewardType: Helper.QuestRewardType,
      pointReward: Helper.PointReward?,
      floatReward: Helper.FLOATReward?,
    ) {
      self.id = id
      self.identifier = identifier
      self.properties = properties
      self.display = display
      self.questDetail = questDetail
      self.challengeDetail = challengeDetail
      self.preconditions = preconditions
      self.participants = participants
      self.participantAmt = participantAmt
      self.rewardType = rewardType
      self.pointReward = pointReward
      self.floatReward = floatReward
    }
  }

  pub struct QuestData {
    pub let identifier: AnyStruct{Interfaces.BountyEntityIdentifier}
    pub let display: MetadataViews.Display
    pub let detail: Interfaces.QuestDetail

    init(
      identifier: AnyStruct{Interfaces.BountyEntityIdentifier},
      display: MetadataViews.Display,
      detail: Interfaces.QuestDetail,
    ) {
      self.identifier = identifier
      self.display = display
      self.detail = detail
    }
  }

  pub struct ChallengeData {
    pub let identifier: AnyStruct{Interfaces.BountyEntityIdentifier}
    pub let display: MetadataViews.Display
    pub let detail: Interfaces.ChallengeDetail

    init(
      identifier: AnyStruct{Interfaces.BountyEntityIdentifier},
      display: MetadataViews.Display,
      detail: Interfaces.ChallengeDetail
    ) {
        self.identifier = identifier
        self.display = display
        self.detail = detail
    }
  }
}
