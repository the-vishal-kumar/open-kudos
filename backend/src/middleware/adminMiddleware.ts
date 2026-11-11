import {
  Middleware,
  Request as RequestDecorator,
  Response as ResponseDecorator
} from '@decorators/express'
import { NextFunction, Response } from 'express'
import { IUserEnhancedRequest } from './definitions/authMiddleware'

// Runs after AuthMiddleware. AuthMiddleware lets every workspace member in
// so they can give kudos from the dashboard; routes that change workspace
// settings, gifts or gift requests also need this check.
export default class AdminMiddleware implements Middleware {
  public use(
    @RequestDecorator() req: IUserEnhancedRequest,
    @ResponseDecorator() res: Response,
    next: NextFunction
  ): void {
    const { is_admin, is_owner, is_primary_owner } = req.user || {} as any

    if (is_admin || is_owner || is_primary_owner) {
      return next()
    }

    res.status(403).send('forbidden')
  }
}
