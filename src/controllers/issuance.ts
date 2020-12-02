import { credentialOffers, serviceUrl } from '../config'
import { Request, Response } from 'express'
import { RedisApi, RequestWithInteractionTokens } from '../types'
import { keyIdToDid } from 'jolocom-lib/js/utils/helper'
import { getDataFromUiForms } from '../helpers'
import { Agent } from '@jolocom/sdk'

const generateCredentialOffer = (
  agent: Agent,
) => async (req: Request, res: Response) => {
  const { credentialType } = req.params

  try {
    const {
      schema: { type: offeredType },
      metadata = {}
    } = credentialOffers[credentialType]

    const credOffer = await agent.credOfferToken(
      {
        callbackURL: `${serviceUrl}/receive/${credentialType}`,
        offeredCredentials: [
          {
            type: offeredType[offeredType.length - 1],
            ...metadata
          }
        ]
      }
    )

    const token = credOffer.encode()
    return res.send({ token, identifier: credOffer.nonce })
  } catch (err) {
    return res.status(500).send({ error: err.message })
  }
}

const consumeCredentialOfferResponse = (
  agent: Agent,
) => async (req: RequestWithInteractionTokens, res: Response) => {
  const { credentialType } = req.params

  if (!credentialType || !credentialOffers[credentialType]) {
    return res.status(401).send('Requested credential type is not supported')
  }

  const credentialOfferResponse = req.userResponseToken
  const claim = await getDataFromUiForms(redis, credentialOfferResponse.nonce)

  const offerInteraction = await agent.processJWT(req.body.token!)

  const credential = await agent.signedCredential(
    {
      metadata: credentialOffers[credentialType].schema,
      claim: { ...claim, message: 'Thank you for testing the endpoint' },
      subject: keyIdToDid(credentialOfferResponse.issuer)
    }
  )

  const credentialReceive = await offerInteraction.createCredentialReceiveToken(
    [credential]
  )

  return res.json({ token: credentialReceive.encode() })
}

export const issuance = {
  generateCredentialOffer,
  consumeCredentialOfferResponse
}
