import { KnownBlock } from '@slack/client'
import '../../models/transfer.model'
import Transfer, { ITransfer } from '../../models/transfer.model'
import LoggerService from './logger'
import SlackClientService from './slackClient'
import TranslationsService from './translationsService'
import UserService from './user'
import SettingsService from './settings'
import moment from 'moment'
import _ from 'lodash'
import Config from '../consts/config'

export default class TransferService {
  private translationsService = new TranslationsService()
  private userService = new UserService()
  private settingsService = new SettingsService()
  private logger = new LoggerService()
  private slackClientService = new SlackClientService()

  public async transferKudos(transfer: ITransfer) {
    const { teamId, senderId, receiverId, value } = transfer

    try {
      const [sender, receiver] = await Promise.all([
        this.userService.getUser(teamId, senderId),
        this.userService.getUser(teamId, receiverId)
      ])

      if (!sender) throw new Error(this.translationsService.getTranslation('couldntFindThePersonWhoGavePoints'))
      if (!receiver) throw new Error(this.translationsService.getTranslation('couldntFindThePersonWhoReceivedPoints'))

      if (value <= sender.kudosGiveable) {
        sender.kudosGiveable -= value
      } else if (value <= (sender.kudosRenewed + sender.kudosGiveable)) {
        sender.kudosRenewed -= value
        sender.kudosRenewed += sender.kudosGiveable
        sender.kudosGiveable = 0
      }

      receiver.kudosGranted += value
      receiver.kudosSpendable += value

      Transfer.create(transfer).then(async (createdTransfer) => {
        if (createdTransfer)
          await Promise.all([
            sender.save(),
            receiver.save(),
          ])
        else throw new Error(this.translationsService.getTranslation('somethingWentWrong'))
      })
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
    userId: string | null = null,
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

    const { hh, mm } = Config.utcHourAndMinForPublishingExchangedKudosOfTheDay
    const yesterdayPublishDateTime = moment().startOf('day').add(hh, 'hour').add(mm, 'minute')
    const publishDateTime = moment().startOf('day').add(hh, 'hour').add(mm, 'minute').add(1, 'day')

    return {
      ...transfers,
      docs: transfers.docs.map((transfer, i) => ({
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
        ).realName,
        isEditable:
          (yesterdayPublishDateTime.unix() <= moment(transfer.date).unix()
            && moment(transfer.date).unix() < publishDateTime.unix()
            && moment().unix() < publishDateTime.unix()
            && transfer.senderId === userId)
      }))
    }
  }

  public async getLeaderboardBlocks(teamId: string): Promise<KnownBlock[]> {
    const usersPosition = [':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:', ':nine:', ':one::zero:'];

    const paginatedTransfers = await this.getAllPaginated(teamId, 99999, 1, null, moment().startOf('week').toDate(), moment().endOf('week').toDate());

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

  public async patchTransfer(
    id: string,
    senderId: string,
    teamId: string,
    comment: string,
  ) {
    const transferToBeEdited = await Transfer.findOne({
      _id: id,
      teamId,
    })

    if (!transferToBeEdited) return null

    if (transferToBeEdited.senderId !== senderId) throw new Error(
      this.translationsService.getTranslation('youDidNotGiveThisKudos')
    )

    const { hh, mm } = Config.utcHourAndMinForPublishingExchangedKudosOfTheDay
    const yesterdayPublishDateTime = moment().startOf('day').add(hh, 'hour').add(mm, 'minute')
    const publishDateTime = moment().startOf('day').add(hh, 'hour').add(mm, 'minute').add(1, 'day')

    if (!(yesterdayPublishDateTime.unix() <= moment(transferToBeEdited.date).unix()
      && moment(transferToBeEdited.date).unix() < publishDateTime.unix())
      && moment().unix() < publishDateTime.unix())
      throw new Error(this.translationsService.getTranslation('kudosAlreadyPublished'))

    return Transfer.findOneAndUpdate({
      _id: id,
      teamId,
    }, {
      comment,
    }, {
      new: true
    })
  }

  public async deleteTransfer(id: string, senderId: string, teamId: string) {
    const transferToBeDeleted = await Transfer.findOne({
      _id: id,
      teamId,
    })

    if (!transferToBeDeleted) return null

    if (transferToBeDeleted.senderId !== senderId) throw new Error(
      this.translationsService.getTranslation('youDidNotGiveThisKudos')
    )

    const { hh, mm } = Config.utcHourAndMinForPublishingExchangedKudosOfTheDay
    const yesterdayPublishDateTime = moment().startOf('day').add(hh, 'hour').add(mm, 'minute')
    const publishDateTime = moment().startOf('day').add(hh, 'hour').add(mm, 'minute').add(1, 'day')

    if (!(yesterdayPublishDateTime.unix() <= moment(transferToBeDeleted.date).unix()
      && moment(transferToBeDeleted.date).unix() < publishDateTime.unix())
      && moment().unix() < publishDateTime.unix())
      throw new Error(this.translationsService.getTranslation('kudosAlreadyPublished'))

    const [sender, receiver, weeklyKudosAmount, weeklyKudosPriviledgedAmount] = await Promise.all([
      this.userService.getUser(teamId, transferToBeDeleted.senderId),
      this.userService.getUser(teamId, transferToBeDeleted.receiverId),
      this.settingsService.getKudosWeeklyAmount(teamId),
      this.settingsService.getKudosPriviledgedWeeklyAmount(teamId),
    ])

    if (!sender) throw new Error(this.translationsService.getTranslation('couldntFindThePersonWhoGavePoints'))
    if (!receiver) throw new Error(this.translationsService.getTranslation('couldntFindThePersonWhoReceivedPoints'))

    const kudosRenewalAmount = sender.havePriviledgedKudosQuota ? weeklyKudosPriviledgedAmount : weeklyKudosAmount

    receiver.kudosGranted -= transferToBeDeleted.value
    receiver.kudosSpendable -= transferToBeDeleted.value

    if (transferToBeDeleted.value <= kudosRenewalAmount - sender.kudosGiveable) {
      sender.kudosGiveable += transferToBeDeleted.value
    } else if (transferToBeDeleted.value <= (sender.kudosRenewed + sender.kudosGiveable)) {
      sender.kudosRenewed += transferToBeDeleted.value
      sender.kudosGiveable += sender.kudosRenewed - kudosRenewalAmount
      sender.kudosRenewed -= sender.kudosGiveable
    }

    const deletedGift = await Transfer.findOneAndDelete({
      _id: id,
      teamId,
    })

    if (!deletedGift) return null

    await Promise.all([
      sender.save(),
      receiver.save(),
    ])

    return deletedGift
  }
}
