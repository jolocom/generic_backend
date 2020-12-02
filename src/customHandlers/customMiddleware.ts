import { RedisApi } from 'src/types'
import { Request, Response, NextFunction } from 'express'
import { Agent } from '@jolocom/sdk'

export const addCustomAuthnMiddleware = (agent: Agent, redis: RedisApi) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  next()
}
