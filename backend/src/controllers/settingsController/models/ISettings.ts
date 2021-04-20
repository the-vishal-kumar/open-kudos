export default interface ISettings {
  botResponseChannelId: string
}

export enum SettingsEnum {
  BotResponseChannelId = 'botResponseChannelId',
  WeeklyKudosAmount = 'weeklyKudosAmount',
  WeeklyKudosPriviledgedAmount = 'weeklyKudosPriviledgedAmount',
  GiftRequestsReceiver = 'giftRequestsReceiver'
}
