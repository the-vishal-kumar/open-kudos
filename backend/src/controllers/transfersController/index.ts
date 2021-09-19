import {
  Body,
  Controller,
  Get,
  Patch,
  Delete,
  Params,
  Query as QueryParam,
  Request as RequestDecorator,
  Response as ResponseDecorator,
} from '@decorators/express'
import { Response } from 'express'
import TransferService from '../../common/services/transfer'
import AuthMiddleware from '../../middleware/authMiddleware'
import { IUserEnhancedRequest } from '../../middleware/definitions/authMiddleware'
import { schemaValidatorFatory } from '../../middleware/schemaValidationMiddleware'
import { TransfersPaginationSchema, NewTransferSchema } from './schemas'
import { INewTransfer } from './models'

@Controller('/transfers', [AuthMiddleware])
export default class TransfersController {
  private transfersService = new TransferService()

  @Get('/', [schemaValidatorFatory(TransfersPaginationSchema)])
  public async getAllTransfers(
    @RequestDecorator() req: IUserEnhancedRequest,
    @QueryParam('limit') limit: number = 10,
    @QueryParam('page') page: number = 1,
    @ResponseDecorator() res: Response
  ) {
    const teamId = req.user.team_id
    const userId = req.user.user_id
    const paginatedTransfers = await this.transfersService.getAllPaginated(
      teamId,
      Number(limit),
      Number(page),
      userId,
    )

    res.json(paginatedTransfers)
  }

  @Patch('/:id', [schemaValidatorFatory(NewTransferSchema)])
  public async patchTransfer(
    @RequestDecorator() req: IUserEnhancedRequest,
    @Params('id') id: string,
    @Body() body: INewTransfer,
    @ResponseDecorator() res: Response
  ) {
    const { comment } = body
    const teamId = req.user.team_id
    const userId = req.user.user_id
    try {
      const editedTransfer = await this.transfersService.patchTransfer(
        id,
        userId,
        teamId,
        comment,
      )

      if (!editedTransfer) {
        return res.status(404).send()
      }

      res.json(editedTransfer)
    } catch ({ message }) {
      res.status(400).send({ message })
    }
  }

  @Delete('/:id', [AuthMiddleware])
  public async deleteTransfer(
    @RequestDecorator() req: IUserEnhancedRequest,
    @Params('id') id: string,
    @ResponseDecorator() res: Response
  ) {
    const teamId = req.user.team_id
    const userId = req.user.user_id
    try {
      const deletedGift = await this.transfersService.deleteTransfer(id, userId, teamId)
      if (!deletedGift) return res.status(404).send()
      res.status(204).send()
    } catch ({ message }) {
      res.status(400).send({ message })
    }
  }
}
