export enum Locale {
  EnGb = 'en-gb'
}

export interface ITranslationsMapping {
  [Locale.EnGb]: ILocaleTranslations
}

// We define this interface to make sure that every language implements all of
// the translations keys
export interface ILocaleTranslations {
  couldntFindThePersonYouWantedToGivePointsTo: string
  forNoReason: string
  hereYouWillFindAllCommandsThatYouCanUse: string
  iCouldntRecognizeThatCommandPleaseUseHelp: string
  xGaveYPoints: string
  youCantGivePointsToYourself: string
  youDontHaveEnoughKudosToTransfer: string
  youTriedToGiveXPointsButThisIsNotValid: string,
  kudosBalance: string,
  giftsList: string,
  getForKudos: string,
  iCouldntRecognizeThatAction: string,
  youBoughtGift: string,
  youDontHaveEnoughKudosOrGiftOut: string,
  demoExpired: string
  leaderboard: string,
  notifyAdminNewGiftPurchase: string,
  fileToLarge: string,
  giftNameReq: string,
  giftMustBePositiveInt: string,
  choose: string,
  reasonCannotBeEmpty: string,
  youGaveYPoints: string,
  youReceivedYPoints: string,
  youDoNotBelongToIndiaTeam: string,
  receiverDoesNotBelongToIndiaTeam: string
}
