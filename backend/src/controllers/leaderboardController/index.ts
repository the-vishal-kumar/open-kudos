import {
  Controller,
  Get,
  Query as QueryParam,
  Request as RequestDecorator,
  Response as ResponseDecorator,
} from '@decorators/express'
import { Response } from 'express'
import UserService from '../../common/services/user'
import AuthMiddleware from '../../middleware/authMiddleware'
import { IUserEnhancedRequest } from '../../middleware/definitions/authMiddleware'
import { schemaValidatorFatory } from '../../middleware/schemaValidationMiddleware'
import { LeaderboardPaginationSchema } from './schemas'
import moment from 'moment'
import { SortOrder } from '../../common/definitions/sortOrder'

@Controller('/leaderboard', [AuthMiddleware])
export default class LeaderboardController {
  private userService = new UserService()

  @Get('/', [schemaValidatorFatory(LeaderboardPaginationSchema)])
  public async getLeaderboard(
    @RequestDecorator() req: IUserEnhancedRequest,
    @QueryParam('startDate') startDate: Date = moment().startOf('week').toDate(),
    @QueryParam('endDate') endDate: Date = moment().endOf('week').toDate(),
    @QueryParam('limit') limit: number = 99999,
    @QueryParam('page') page: number = 1,
    @QueryParam('sortOrder') sortOrder: SortOrder = 'ascend',
    @QueryParam('sortColumn') sortColumn: string = '',
    @ResponseDecorator() res: Response
  ) {
    const teamId = req.user.team_id

    const leaderboard = await this.userService.getLeaderboard(
      teamId,
      startDate,
      endDate,
      Number(limit),
      Number(page),
      sortOrder,
      sortColumn,
    )

    res.json(leaderboard)
  }
}
