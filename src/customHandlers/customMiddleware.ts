import { RequestWithInteractionTokens, RedisApi } from 'src/types'
import { Response, NextFunction } from 'express'
import { library } from 'src/controllers/library'


export const addCustomAuthnMiddleware = (redis: RedisApi) => async (
  req: RequestWithInteractionTokens,
  res: Response,
  next: NextFunction
) => {
  next()
}
