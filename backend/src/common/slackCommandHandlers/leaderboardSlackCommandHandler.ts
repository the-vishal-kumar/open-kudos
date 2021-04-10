import { SlackResponseType } from "../factories/definitions/slackCommandHandlerFactory"
import TransferService from "../services/transfer"
import BaseSlackCommandHandler from "./baseSlackCommandHandler"

export default class LeaderboardSlackCommandHandler extends
  BaseSlackCommandHandler {
  public async onHandleCommand() {
    this.sendMessage(
      this.translationsService.getTranslation("leaderboard"),
      await this.getMessageConsumer(),
      SlackResponseType.Hidden,
      await this.getLeaderboardBlocks()
    )
  }

  public getLeaderboardBlocks() {
    const transferService = new TransferService()

    return transferService.getLeaderboardBlocks(this.teamId)
  }
}
