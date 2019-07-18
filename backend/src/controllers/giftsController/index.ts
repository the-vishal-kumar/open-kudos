import {
  Body,
  Controller,
  Get,
  Post,
  Query as QueryParam,
  Request as RequestDecorator,
  Response as ResponseDecorator
} from '@decorators/express'
import { Response } from 'express'
import GiftService from '../../common/services/gift'
import AuthMiddleware from '../../middleware/authMiddleware'
import { IUserEnhancedRequest } from '../../middleware/definitions/authMiddleware'
import { schemaValidatorFatory } from '../../middleware/schemaValidationMiddleware'
import { INewGift } from './models'
import { NewGiftSchema } from './schemas'

@Controller('/gifts', [AuthMiddleware])
export default class GiftsController {
  private giftService = new GiftService()

  @Get('/')
  public async getAllGifts(
    @RequestDecorator() req: IUserEnhancedRequest,
    @QueryParam('skip') offset: number = 0,
    @QueryParam('take') limit: number = 10,
    @ResponseDecorator() res: Response
  ) {
    const teamId = req.user.team_id
    const paginatedGifts = await this.giftService.getAllPaginated(
      teamId,
      Number(limit),
      Number(offset)
    )
    res.json(paginatedGifts)
  }

  @Post('/', [schemaValidatorFatory(NewGiftSchema)])
  public async postGift(
    @RequestDecorator() req: IUserEnhancedRequest,
    @Body() body: INewGift,
    @ResponseDecorator() res: Response
  ) {
    const { name, cost, description } = body
    const teamId = req.user.team_id
    const newGift = await this.giftService.addGift(
      teamId,
      name,
      cost,
      description
    )
    res.json(newGift)
  }

}