import { IdentityWallet } from 'jolocom-lib/js/identityWallet/identityWallet'
import { RedisApi, RequestWithInteractionTokens } from 'src/types'
import { Request, Response } from 'express'
import { password, serviceUrl } from '../config'
import { setStatusPending, setStatusDone } from '../helpers'
import { Authentication } from 'jolocom-lib/js/interactionTokens/authentication'

const generateAuthenticationRequest = (
  identityWallet: IdentityWallet,
  redis: RedisApi
) => async (req: Request, res: Response) => {
  const description = req.query.desc || 'Some random action'
  const callbackURL = `${serviceUrl}/auth`

  try {
    const authRequest = await identityWallet.create.interactionTokens.request.auth(
      {
        callbackURL,
        description
      },
      password
    )

    const token = authRequest.encode()
    const identifier = authRequest.nonce
    await setStatusPending(redis, identifier, { request: token })

    return res.send({ token, identifier })
  } catch (err) {
    return res.status(500).send({ error: err.message })
  }
}

const consumeAuthenticationResponse = (
  identityWallet: IdentityWallet,
  redis: RedisApi
) => async (request: RequestWithInteractionTokens, response: Response) => {
  const { nonce } = request.serviceRequestToken
  const { description: reqDescription } = request.userResponseToken
    .interactionToken as Authentication
  const { description: resDescription } = request.serviceRequestToken
    .interactionToken as Authentication

  if (reqDescription === resDescription) {
    return response
      .status(401)
      .send('The received description does not match the requested one')
  }

  // TODO @clauxx check description ??
  // to confirm that the user agreed to exactly the action requested
  await setStatusDone(redis, nonce)
  return response.status(200).send()
}

export const authentication = {
  generateAuthenticationRequest,
  consumeAuthenticationResponse
}
