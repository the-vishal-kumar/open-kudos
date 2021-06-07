import { KnownBlock } from '@slack/client'
import '../../models/user.model'
import User, { IUser } from '../../models/user.model'
import Workspace, { IWorkspace } from '../../models/workspace.model'
import { SortOrder } from '../definitions/sortOrder'
import { IKudosAmountForWorkspace } from './definitions/settingsService'
import LoggerService from './logger'
import SlackClientService from './slackClient'
import axios, { AxiosRequestConfig } from 'axios'

export default class UserService {
  private slackClientService = new SlackClientService()
  private logger = new LoggerService()

  public create(user: IUser) {
    return User.create(user)
  }

  public async handleUserIfNotExist(teamId: string, userId: string) {
    // TODO: Add created user to cache to improve
    const doesUserExist = await this.checkIfUserExist(teamId, userId)
    if (!doesUserExist) {
      const workspace = await Workspace.findOne({ teamId })
      const configUserInfo: AxiosRequestConfig = {
        method: 'get',
        url: `https://slack.com/api/users.info?user==${userId}&pretty=1`,
        headers: {
          'Authorization': `Bearer ${workspace.botAccessToken}`
        }
      }
      let { data: { ok, user } } = await axios(configUserInfo)
      if (ok) {
        const {
          is_bot,
          name,
          deleted,
          is_admin,
          profile
        } = user
        if (!is_bot && deleted === false && name !== 'slackbot') {
          await this.createUser({
            email: profile.email,
            isAdmin: is_admin ? is_admin : false,
            name,
            realName: profile.real_name,
            teamId,
            userId
          } as IUser)
        }
      }
    }
  }

  public async initUsers(workspace: IWorkspace) {
    this.slackClientService.initWebClient(workspace)

    try {
      const usersToInit = await this.slackClientService.getWorkspaceMembers(
        workspace.teamId
      )

      for (const user of usersToInit) {
        const { email, isAdmin, teamId, userId } = user

        await User.findOneAndUpdate(
          {
            $and: [
              { teamId },
              { userId }
            ]
          },
          {
            email,
            isAdmin,
            teamId,
            userId
          },
          {
            setDefaultsOnInsert: true,
            upsert: true,
          }
        )
      }
    } catch (error) {
      this.logger.logError(error)
    }
  }

  public getUser(teamId: string, userId: string) {
    return User.findOne({
      $and: [
        { teamId },
        { userId }
      ]
    })
  }

  public async getUsers(teamId: string) {
    const users =
      await this.slackClientService.getWorkspaceMembers(teamId)

    return users.map(({ name, userId }) => ({
      name,
      userId,
    }))
  }

  public async getUsersWhoCanReceiveGiftRequest(teamId: string) {
    return User.find({ canReceiveGiftsRequest: true })
  }

  public renewAllUsersKudos
    (kudosAmountForWorkspace: IKudosAmountForWorkspace[]) {
    let updateUsersFromTeams = kudosAmountForWorkspace
      .map((item) => User.updateMany(
        { teamId: item.teamId, havePriviledgedKudosQuota: false },
        { $set: { kudosRenewed: item.weeklyKudosAmount } }).exec()
      )

    kudosAmountForWorkspace
      .map((item) =>
        updateUsersFromTeams.push(
          User.updateMany(
            { teamId: item.teamId, havePriviledgedKudosQuota: true },
            { $set: { kudosRenewed: item.weeklyKudosPriviledgedAmount } }).exec()
        )
      )

    return Promise.all(updateUsersFromTeams)
  }

  public async discardAllUsersOldKudos() {
    const users = await User.find();

    for (let i = 0; i < users.length; i++) {
      users[i].kudosGiveable = users[i].kudosRenewed;
      users[i].kudosRenewed = 0;
      await users[i].save();
    }
  }

  public async getAdmin(teamId: string) {
    return await User.findOne({
      isAdmin: true,
      teamId
    })
  }

  public async getAdmins(teamId: string) {
    const users =
      await this.slackClientService.getWorkspaceMembers(teamId)

    const workspaceAdminsIds = users
      .filter(({ isAdmin }) => isAdmin)
      .map(({ userId }) => userId)

    const admins = await User.find(
      {
        teamId,
        userId: { $in: workspaceAdminsIds }
      }
    )

    return admins.map(({ _id, name, userId }) => ({
      _id,
      name: name || users.find(user => user.userId === userId).name,
      userId,
    }))
  }

  public async checkIfUserExist(
    teamId: string,
    userId: string
  ): Promise<boolean> {
    const user = await this.getUser(teamId, userId)

    return !!user
  }

  public async createUser(user: IUser) {
    return User.create(user)
  }

  public async getTeamInfo(
    teamId: string,
    limit?: number,
    page?: number,
    sortOrder?: SortOrder,
    sortColumn?: string
  ) {
    const members = await this.slackClientService.getWorkspaceMembers(teamId)
    // const membersIds = members.map(({ userId }) => userId)
    // Get India Team Members
    const membersIds = await this.slackClientService.getChannelMembers(teamId)
    const aggregate = User.aggregate()

    aggregate.match({
      teamId,
      userId: { $in: membersIds }
    })

    const order = sortOrder === 'ascend' ? 1 : -1

    const sortField = sortColumn
      ? { [sortColumn]: order }
      : { kudosSpendable: -1 }

    const users = await User.aggregatePaginate(aggregate, {
      limit,
      page,
      sort: sortField
    })

    return {
      ...users,
      docs: users.docs.map(user => {
        const member = members.find(({ userId }) => userId === user.userId)
        return {
          ...user,
          name: member ? member.name : String.empty,
          realName: member ? member.realName : String.empty
        }
      })
    }
  }

  public async getLeaderboard(
    teamId: string,
    startDate: Date,
    endDate: Date,
    limit?: number,
    page?: number,
    sortOrder?: SortOrder,
    sortColumn?: string
  ) {
    const members = await this.slackClientService.getWorkspaceMembers(teamId)
    // const membersIds = members.map(({ userId }) => userId)
    // Get India Team Members
    const membersIds = await this.slackClientService.getChannelMembers(teamId)
    const aggregate = User.aggregate([
      {
        $match: {
          teamId,
          userId: { $in: membersIds }
        }
      },
      {
        $lookup: {
          from: 'transfers',
          let: { userId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$receiverId', '$$userId']
                    },
                    {
                      $gte: ['$date', new Date(startDate)],
                    },
                    {
                      $lte: ['$date', new Date(endDate)],
                    }
                  ]
                }
              }
            }
          ],
          as: 'transfers'
        }
      },
      {
        $project: {
          _id: "$_id",
          teamId: "$teamId",
          userId: "$userId",
          email: "$email",
          kudosGranted: { $sum: "$transfers.value" },
          // transfers: '$transfers'
        }
      },
      {
        $match: {
          kudosGranted: { $gt: 0 },
        }
      }
    ]);

    const sortField = sortColumn
      ? { [sortColumn]: sortOrder }
      : { kudosGranted: -1 }

    const users = await User.aggregatePaginate(aggregate, {
      limit,
      page,
      sort: sortField,
    });

    return {
      ...users,
      docs: users.docs.map((user, i) => {
        const member = members.find(({ userId }) => userId === user.userId)
        return {
          ...user,
          rank: limit * (page - 1) + i + 1,
          name: member ? member.name : String.empty,
          realName: member ? member.realName : String.empty
        }
      })
    };
  }
}
