import { RedisApi, RequestWithInteractionTokens } from './types'
import { RequestWithInteractionTokens } from './types'
import { NextFunction, Response } from 'express'
import { CredentialResponse } from 'jolocom-lib/js/interactionTokens/credentialResponse'
import { CredentialRequest } from 'jolocom-lib/js/interactionTokens/credentialRequest'

export const validateCredentialsAgainstRequest = async (
  req: RequestWithInteractionTokens,
  res: Response,
  next: NextFunction
) => {
  const response = req.userResponseToken.interactionToken as CredentialResponse
  const request = req.serviceRequestToken.interactionToken as CredentialRequest

  if (!response.satisfiesRequest(request)) {
    res
      .status(401)
      .send(
        'The supplied credentials do not match the types of the requested credentials'
      )
  }

  next()
}
