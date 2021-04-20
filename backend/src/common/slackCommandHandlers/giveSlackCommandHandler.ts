import { ITransfer } from "../../models/transfer.model"
import Workspace from "../../models/workspace.model"
import { SlackResponseType } from "../factories/definitions/slackCommandHandlerFactory"
import TransferService from "../services/transfer"
import BaseSlackCommandHandler from "./baseSlackCommandHandler"
import axios, { AxiosRequestConfig } from 'axios'
const { SLACK_WORKSPACE_NAME } = process.env; // eslint-disable-line no-unused-vars

export default class GiveSlackCommandHandler extends BaseSlackCommandHandler {
  private transferService = new TransferService()

  get transactionComment() {
    const wordsInCommand = this.commandText.split(" ")
    return wordsInCommand.length > 3
      ? `${wordsInCommand.slice(3, wordsInCommand.length).join(" ")}`
      : '' // this.translationsService.getTranslation("forNoReason")
  }

  get receiverId() {
    const [, escapedReceiverId = String.empty] = this.commandText.split(" ")
    const receiverId = `${escapedReceiverId
      .substring(0, escapedReceiverId.indexOf('|'))}>`

    return receiverId
  }

  get validReceiverId() {
    return this.receiverId.substring(2, this.receiverId.length - 1)
  }

  get transferKudosCount() {
    const [, , points = String.empty] = this.commandText.split(" ")

    return points
  }

  get validTransferKudosCount() {
    const [, , points = String.empty] = this.commandText.split(" ")
    const validPoints = Number(points)

    return Number.isInteger(validPoints) && validPoints > 0 && validPoints
  }

  get isReceiverUserIdInvalid() {
    const receiverIdRegexMatches = this.receiverId.match(/^<@.*>$/)

    return !receiverIdRegexMatches
  }

  get transfer(): ITransfer {
    return {
      comment: this.transactionComment,
      receiverId: this.validReceiverId,
      senderId: this.senderId,
      teamId: this.teamId,
      value: this.validTransferKudosCount
    }
  }

  public async onHandleCommand() {
    await this.transferService.transferKudos(this.transfer)
    const { senderId, receiverId, teamId } = this.transfer
    this.sendMessage(
      this.getCommandResponseForSender(),
      {
        channel: senderId,
        teamId: teamId,
        user: senderId
      },
      SlackResponseType.Standard
    )

    this.sendMessage(
      this.getCommandResponseForReceiver(),
      {
        channel: receiverId,
        teamId: teamId,
        user: receiverId,
      },
      SlackResponseType.Standard
    )
  }

  public getCommandResponseForSender() {
    const { senderId, receiverId, value, comment } = this.transfer
    return this.translationsService.getTranslation(
      "youGaveZPoints",
      senderId,
      receiverId,
      value,
      comment
    )
  }

  public getCommandResponseForReceiver() {
    const { senderId, receiverId, value, comment } = this.transfer
    return this.translationsService.getTranslation(
      "youReceivedZPoints",
      senderId,
      receiverId,
      value,
      comment
    )
  }

  protected async validate() {
    if (this.isReceiverUserIdInvalid) {
      throw new Error(
        this.translationsService.getTranslation(
          "couldntFindThePersonYouWantedToGivePointsTo"
        )
      )
    }

    if (this.validReceiverId === this.senderId) {
      throw new Error(
        this.translationsService.getTranslation("youCantGivePointsToYourself")
      )
    }

    if (!this.validTransferKudosCount) {
      throw new Error(
        this.translationsService.getTranslation(
          "youTriedToGiveXPointsButThisIsNotValid",
          this.transferKudosCount
        )
      )
    }

    if (await this.transferService.isKudosAmountToLow(this.transfer)) {
      throw new Error(
        this.translationsService
          .getTranslation("youDontHaveEnoughKudosToTransfer")
      )
    }

    if (this.transactionComment.split(' ').length < 4 || this.transactionComment.length < 10) {
      throw new Error(
        this.translationsService.getTranslation(
          "reasonCannotBeEmpty"
        )
      )
    }

    // Check whether sender and receiver belongs to India Team
    const { teamId, botAccessToken } = await Workspace.findOne({ teamName: SLACK_WORKSPACE_NAME });
    const botResponseChannelId = await this.slackClientService.getResponseBotChannelId(teamId);
    const apiConfig: AxiosRequestConfig = {
      method: `get`,
      url: `https://slack.com/api/conversations.members?pretty=1&channel=${botResponseChannelId}`,
      headers: {
        'Authorization': `Bearer ${botAccessToken}`
      }
    };
    const { data: { ok, members: channelMembers, error } } = await axios(apiConfig);
    if (ok && channelMembers.length > 0) {
      const indexOfSender = channelMembers.findIndex(memberId => memberId == this.senderId);
      if (indexOfSender === -1) {
        throw new Error(
          this.translationsService.getTranslation("youDoNotBelongToIndiaTeam")
        )
      }
      const indexOfReceiver = channelMembers.findIndex(memberId => memberId == this.receiverId.substring(2, this.receiverId.length - 1));
      if (indexOfReceiver === -1) {
        throw new Error(
          this.translationsService.getTranslation("receiverDoesNotBelongToIndiaTeam")
        )
      }
    }
  }
}
