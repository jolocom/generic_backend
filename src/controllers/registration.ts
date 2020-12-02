import { Response, Request } from 'express'
import { Agent } from '@jolocom/sdk'

import { RedisApi, RequestWithInteractionTokens } from '../types'
import {
  credentialRequirements,
  serviceUrl
} from '../config'
import {
  extractDataFromClaims,
  generateRequirementsFromConfig,
  setStatusDone,
  setStatusPending,
  areTypesAvailable
} from '../helpers/'
import { CredentialResponse } from 'jolocom-lib/js/interactionTokens/credentialResponse'
import { Endpoints } from '../sockets'
import { applyValidationFunction } from '../helpers/validators'

const generateCredentialShareRequest = (
  agent: Agent,
  redis: RedisApi
) => async (req: Request, res: Response) => {
  // NOTE Credential requirement types provided by the frontend
  // e.g. demo.sso/share?types=id,name,

  const queryTypes: string[] = req.query.types.split(',')
  const callbackURL = `${serviceUrl}${Endpoints.share}`

  if (!areTypesAvailable(queryTypes, credentialRequirements)) {
    return res.status(500).send({ error: 'Credential Type not found' })
  }

  const credentialRequest = await agent.credRequestToken(
    {
      callbackURL,
      credentialRequirements: queryTypes.reduce(
        (acc, credentialType) =>
          credentialRequirements[credentialType]
            ? [
              ...acc,
              generateRequirementsFromConfig(
                credentialRequirements[credentialType]
              )
            ]
            : acc,
        []
      )
    }
  )

  const token = credentialRequest.encode()
  await setStatusPending(redis, credentialRequest.nonce, { request: token })
  return res.send({ token, identifier: credentialRequest.nonce })
}

const consumeCredentialShareResponse = (agent: Agent, redis: RedisApi) => async (
  req: RequestWithInteractionTokens,
  res: Response
) => {
  try {
    const verificationInteraction = await agent.processJWT(req.body.token!)

    // @ts-ignore
    const passesValidation = verificationInteraction.getSummary().state.providedCredentials.every(
      applyValidationFunction
    )

    if (!passesValidation) {
      return res
        .status(401)
        .send('The supplied data did not satisfy the validation requirements')
    }

    const data = {
      ...extractDataFromClaims(verificationInteraction.lastMessage.interactionToken as CredentialResponse),
      ...req.middlewareData,
      did: req.userResponseToken.issuer
    }

    await setStatusDone(redis, verificationInteraction.id, data)
    return res.status(200).send()
  } catch (err) {
    console.log(err)
    return res.status(401).send(err.message)
  }
}

export const registration = {
  generateCredentialShareRequest,
  consumeCredentialShareResponse
}
