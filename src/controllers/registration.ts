import { Request, Response } from 'express'
import { IdentityWallet } from 'jolocom-lib/js/identityWallet/identityWallet'

import { RedisApi, RequestWithInteractionTokens } from '../types'
import {
  credentialRequirements,
  currentCredentialRequirements,
  password,
  serviceUrl
} from '../config'
import {
  extractDataFromClaims,
  generateRequirementsFromConfig,
  setStatusDone,
  setStatusPending
} from '../helpers/'
import { CredentialResponse } from 'jolocom-lib/js/interactionTokens/credentialResponse'
import { Endpoints } from '../sockets'
import { applyValidationFunction } from '../helpers/validators'

const generateCredentialShareRequest = (
  identityWallet: IdentityWallet,
  redis: RedisApi
) => async (req: Request, res: Response) => {
  const callbackURL = `${serviceUrl}${Endpoints.authn}`

  const credentialRequest = await identityWallet.create.interactionTokens.request.share(
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
    },
    password
  )

  const token = credentialRequest.encode()
  await setStatusPending(redis, credentialRequest.nonce, { request: token })
  console.log(token)
  res.send({ token, identifier: credentialRequest.nonce })
}

const consumeCredentialShareResponse = (redis: RedisApi) => async (
  req: RequestWithInteractionTokens,
  res: Response
) => {
  const response = req.userResponseToken.interactionToken as CredentialResponse
  const { issuer, nonce } = req.serviceRequestToken

  try {
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
      did: issuer
    }

    await setStatusDone(redis, nonce, data)
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
