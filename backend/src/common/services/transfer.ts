import { KnownBlock } from '@slack/client'
import '../../models/transfer.model'
import Transfer, { ITransfer } from '../../models/transfer.model'
import LoggerService from './logger'
import SlackClientService from './slackClient'
import TranslationsService from './translationsService'
import UserService from './user'
import moment from 'moment'
import _ from 'lodash'

export default class TransferService {
  private translationsService = new TranslationsService()
  private userService = new UserService()
  private logger = new LoggerService()
  private slackClientService = new SlackClientService()

  public async transferKudos(transfer: ITransfer) {
    const { teamId, senderId, receiverId, value } = transfer

    try {
      const [sender, receiver] = await Promise.all([
        this.userService.getUser(teamId, senderId),
        this.userService.getUser(teamId, receiverId)
      ])

      if (value <= sender.kudosGiveable) {
        sender.kudosGiveable -= value
      } else if (value <= (sender.kudosRenewed + sender.kudosGiveable)) {
        sender.kudosRenewed -= value
        sender.kudosRenewed += sender.kudosGiveable
        sender.kudosGiveable = 0
      }

      receiver.kudosGranted += value
      receiver.kudosSpendable += value

      await Promise.all([
        sender.save(),
        receiver.save(),
        Transfer.create(transfer)
      ])

    } catch (error) {
      this.logger.logError(error)
    }
  }

  public async isKudosAmountToLow(transfer: ITransfer) {
    const { teamId, senderId, value } = transfer
    try {
      const sender = await this.userService.getUser(teamId, senderId)
      return sender.kudosGiveable + sender.kudosRenewed < value
    } catch (error) {
      this.logger.logError(error)
    }
  }

  public async getKudosBalance(teamId: string, userId: string) {
    const {
      kudosRenewed,
      kudosGiveable,
      kudosSpendable
    } = await this.userService.getUser(teamId, userId)

    return this.translationsService.getTranslation(
      'kudosBalance',
      kudosGiveable + kudosRenewed,
      kudosSpendable
    )
  }

  public async getAllPaginated(
    teamId: string,
    limit?: number,
    page?: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const members = await this.slackClientService.getWorkspaceMembers(teamId)
    const membersIds = members.map(({ userId }) => userId)
    const aggregate = Transfer.aggregate()

    let criteria = {};

    if (startDate && endDate) {
      criteria = {
        receiverId: { $in: membersIds },
        senderId: { $in: membersIds },
        teamId,
        $and: [
          { date: { $gt: new Date(startDate) } },
          { date: { $lte: new Date(endDate) } }

        ]
      }
    } else {
      criteria = {
        receiverId: { $in: membersIds },
        senderId: { $in: membersIds },
        teamId,
      }
    }

    aggregate.match(criteria)

    const transfers = await Transfer.aggregatePaginate(aggregate, {
      limit,
      page,
      sort: {
        date: -1
      }
    })

    return {
      ...transfers,
      docs: transfers.docs.map(transfer => ({
        ...transfer,
        receiverName: members.find(
          member => member.userId === transfer.receiverId
        ).name,
        receiverRealName: members.find(
          member => member.userId === transfer.receiverId
        ).realName,
        senderName: members.find(
          member => member.userId === transfer.senderId
        ).name,
        senderRealName: members.find(
          member => member.userId === transfer.senderId
        ).realName
      }))
    }
  }

  public async getLeaderboardBlocks(teamId: string): Promise<KnownBlock[]> {
    const usersPosition = [':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:', ':nine:', ':one::zero:'];

    const paginatedTransfers = await this.getAllPaginated(teamId, 99999, 1, moment().startOf('week').toDate(), moment().endOf('week').toDate());

    const transfersPerUser = paginatedTransfers.docs.reduce((total, currentValue, currentIndex, arr) => {
      let indexOfUser = total.findIndex((x) => x.userId == currentValue.receiverId);
      if (indexOfUser != -1) {
        total[indexOfUser].kudosGranted += currentValue.value;
      } else {
        total.push({
          userId: currentValue.receiverId,
          kudosGranted: currentValue.value
        })
      }
      return total
    }, []);

    const top10Users = _.sortBy(transfersPerUser, ['kudosGranted']).reverse();

    const text = top10Users.length > 0 ? top10Users
      .slice(0, 10)
      .map((user, index) => `${usersPosition[index]} <@${user.userId}> - ${user.kudosGranted}\n`)
      .join('\n') : this.translationsService.getTranslation('emptyLeaderboard');

    return [
      {
        text: {
          text,
          type: "mrkdwn"
        },
        type: "section",
      }
    ];
  }
}
