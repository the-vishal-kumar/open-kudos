import { IMessageConsumer } from "../../controllers/definitions/slackController"
import { IGiftTransfer } from "../../models/giftTransfer.model"
import { SlackResponseType } from "../factories/definitions/slackCommandHandlerFactory"
import GiftTransferService from "../services/giftTransfer"
import SettingsService from "../services/settings"
import UserService from "../services/user"
import BaseSlackActionHandler from "./baseSlackActionHandler"

export default class BuyGiftSlackActionHandler extends BaseSlackActionHandler {
  private giftTransferService = new GiftTransferService()
  private settingsService = new SettingsService()
  protected userService = new UserService()

  get giftAction() {
    const [giftClickAction] = this.action.actions
    return giftClickAction
  }

  get giftId() {
    return this.giftAction.value
  }

  get giftTransfer(): IGiftTransfer {
    return {
      giftId: this.giftId,
      teamId: this.teamId,
      userId: this.userId
    }
  }

  public async validate(): Promise<void> {
    const giftInStockAndUserHasKudos =
      await this.giftTransferService.validateTransfer(this.giftTransfer)

    if (!giftInStockAndUserHasKudos) {
      throw new Error(
        this.translationsService.getTranslation(
          "youDontHaveEnoughKudosOrGiftOut"
        )
      )
    }
  }

  public async onHandleAction(): Promise<void> {
    const { name, cost } = await this.giftTransferService
      .transferGift(this.giftTransfer)

    this.sendResponse(
      this.translationsService.getTranslation(
        "notifyAdminNewGiftPurchase",
        this.userId,
        name,
        cost
      ))

    const usersWhoCanReceiveGiftRequest =
      await this.userService.getUsersWhoCanReceiveGiftRequest(this.teamId)

    const allUserIdsWhoCanReceiveGiftRequest = usersWhoCanReceiveGiftRequest.map(x => x.userId);

    const adminId =
      await this.settingsService.getGiftRequestsReceiver(this.teamId)

    if (adminId) {
      allUserIdsWhoCanReceiveGiftRequest.push(adminId);
    }

    if (allUserIdsWhoCanReceiveGiftRequest.length > 0) {
      for (let i = 0; i < allUserIdsWhoCanReceiveGiftRequest.length; i++) {
        const messageConsumer: IMessageConsumer = {
          channel: allUserIdsWhoCanReceiveGiftRequest[i],
          teamId: this.teamId,
          user: adminId,
        }

        this.sendMessage(
          this.translationsService.getTranslation(
            "notifyAdminNewGiftPurchase",
            this.userId,
            name,
            cost
          ),
          messageConsumer,
          SlackResponseType.Standard
        )
      }
    }
  }
}
