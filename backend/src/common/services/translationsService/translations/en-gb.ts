// tslint:disable:max-line-length
import { ILocaleTranslations } from "../../definitions/translationsService"
export default {
  "couldntFindThePersonYouWantedToGivePointsTo": "Couldn't find the person you wanted to give points to :(",
  "forNoReason": "for no reason",
  "getForKudos": "Get for {0} Kudos",
  "giftsList": "There are the list of gifts you can buy",
  // "hereYouWillFindAllCommandsThatYouCanUse": "Happy to help, below a list of commands that you can currently use:\n\n*give @person 10 for helping with code review.*\n- this is the main feature of the bot.\n- the message structure: give @pointsReceiver [number of points] for [reason]\n- you can give some points to somebody for some reason\n\n*balance* - this command returns your current balance of points.\n\n*gifts* - this command displays a list of gifts that you can get after exchanging your received points.\n\n*leaderboard* - this command displays a list of top 10 users with the biggest amount of kudos received this week.\n\n*help* - I guess you already know how it works.",
  "hereYouWillFindAllCommandsThatYouCanUse": `Happy to help, below a list of commands that you can currently use:\n
  *balance*
  - see your current kudos balance\n
  *give*
  - this is the main feature of the bot where you give points to fellow co-worker
  - the message structure: */kudos give @receiver for [reason]*
  - you cannot give kudos to somebody for no reason
  - reason shall be atleast 3 words and 10 characters\n
  *leaderboard*
  - see displays a list of top 10 users with the highest kudos received this week\n
  *help*
  - you already know how it works`,
  "iCouldntRecognizeThatAction": "I couldn't recognize that action, please contact the administrator",
  "iCouldntRecognizeThatCommandPleaseUseHelp": "I couldn't recognize that command please use */kudos help* to see the list of commands",
  "kudosBalance": "Here is your Kudos balance\n\n*Kudos to Give*\n{0} Kudos\nThese are Kudos you can give to your teammates and are reset every Monday midnight.\n\n*Kudos to Spend*\n{1} Kudos \nYou receive these Kudos from your teammates and can spend them to buy gifts. They never expire.",
  "xGaveYPoints": "<@{1}> received kudos from <@{0}> {3}.",
  "youBoughtGift": "You've purchased *{0}* for {1} kudos. Please contact the office manager to collect the gift",
  "youCantGivePointsToYourself": "You cant add points for yourself :(",
  "youDontHaveEnoughKudosOrGiftOut": "You don't have enough kudos to buy a gift or the gift is out of stock :(",
  "youDontHaveEnoughKudosToTransfer": "You don't have enough kudos to transfer",
  "youTriedToGiveXPointsButThisIsNotValid": "You tried to give {0} but this is not valid amount of points :(",
  "demoExpired": "Demo of the bot expired. Please check the instructions how to install the bot on own server or contact kudos@pagepro.co to extend the demo mode.",
  "leaderboard": "*Leaderboard*",
  "notifyAdminNewGiftPurchase": "<@{0}> just purchased {1} for {2} kudos.",
  "fileToLarge": "File too large.",
  "giftNameReq": "Gift name is required.",
  "giftMustBePositiveInt": "Gift cost must be a positive integer.",
  "choose": "Choose",
  "reasonCannotBeEmpty": "Reason shall be more than 3 words and 10 characters",
  "youGaveYPoints": "You have given kudos to <@{1}> {3}.",
  "youReceivedYPoints": "You have received kudos from <@{0}> {3}.",
  "youDoNotBelongToIndiaTeam": "You do not belong to India Team",
  "receiverDoesNotBelongToIndiaTeam": "Receiver doesn't not belong to India Team",
  "emptyLeaderboard": "Empty Leaderboard! No Kudos were exchanged this week!",
  "somethingWentWrong": "Oops! Something went wrong!",
} as ILocaleTranslations