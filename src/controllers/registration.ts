import { Response } from 'express'
import { Agent } from '@jolocom/sdk'

import { RedisApi, RequestWithInteractionTokens } from '../types'
import {
  credentialRequirements,
  currentCredentialRequirements,
  serviceUrl
} from '../config'
import {
  extractDataFromClaims,
  generateRequirementsFromConfig,
} from '../helpers/'
import { CredentialResponse } from 'jolocom-lib/js/interactionTokens/credentialResponse'
import { Endpoints } from '../sockets'
import { applyValidationFunction } from '../helpers/validators'

const generateCredentialShareRequest = (
  agent: Agent,
) => async (req: RequestWithInteractionTokens, res: Response) => {
  const callbackURL = `${serviceUrl}${Endpoints.authn}`

  const credentialRequest = await agent.credRequestToken(
    {
      callbackURL,
      credentialRequirements: currentCredentialRequirements.reduce(
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
  console.log(token)
  res.send({ token, identifier: credentialRequest.nonce })
}

const consumeCredentialShareResponse = (agent: Agent) => async (
  req: RequestWithInteractionTokens,
  res: Response
) => {
  const response = req.userResponseToken.interactionToken as CredentialResponse

  try {
    const verificationInteraction = await agent.processJWT(req.body.token!)

    const passesValidation = response.suppliedCredentials.every(
      applyValidationFunction
    )

    if (!passesValidation) {
      return res
        .status(401)
        .send('The supplied data did not satisfy the validation requirements')
    }

    const data = {
      ...extractDataFromClaims(response),
      ...req.middlewareData,
      did: req.userResponseToken.issuer
    }

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
