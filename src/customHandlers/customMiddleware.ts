import { RequestWithInteractionTokens } from 'src/types'
import { Response, NextFunction } from 'express'
import { Agent } from '@jolocom/sdk'

export const addCustomAuthnMiddleware = (agent: Agent) => async (
  req: RequestWithInteractionTokens,
  res: Response,
  next: NextFunction
) => {
  next()
}
