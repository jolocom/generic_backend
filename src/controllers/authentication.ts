import { Agent } from '@jolocom/sdk'
import { RedisApi, RequestWithInteractionTokens } from 'src/types'
import { Request, Response } from 'express'
import { password, serviceUrl } from '../config'
import { setStatusPending, setStatusDone } from '../helpers'
import { Authentication } from 'jolocom-lib/js/interactionTokens/authentication'

const generateAuthenticationRequest = (
  agent: Agent,
  redis: RedisApi
) => async (req: Request, res: Response) => {
  const description = req.query.desc || 'Some random action'
  const callbackURL = `${serviceUrl}/auth`

  try {
    const authRequest = await agent.authRequestToken(
      {
        callbackURL,
        description
      }
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
  agent: Agent,
  redis: RedisApi
) => async (request: Request, response: Response) => {
  try {
    const authInteraction = await agent.processJWT(request.body.token!)

    await setStatusDone(redis, authInteraction.id)
    return response.status(200).send()
  } catch (err) {
    return response
      .status(401)
      .send(err.toString())
  }
}

export const authentication = {
  generateAuthenticationRequest,
  consumeAuthenticationResponse
}
