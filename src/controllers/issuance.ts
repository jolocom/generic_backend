import { credentialOffers, password, serviceUrl } from '../config'
import { Request, Response } from 'express'
import { IdentityWallet } from 'jolocom-lib/js/identityWallet/identityWallet'
import { RedisApi, RequestWithInteractionTokens } from '../types'
import { keyIdToDid } from 'jolocom-lib/js/utils/helper'
import { getDataFromUiForms, setStatusDone, setStatusPending } from '../helpers'

const generateCredentialOffer = (
  identityWallet: IdentityWallet,
  redis: RedisApi
) => async (req: Request, res: Response) => {
  const { credentialType } = req.params

  try {
    const {
      schema: { type: offeredType },
      metadata = {}
    } = credentialOffers[credentialType]

    const credOffer = await identityWallet.create.interactionTokens.request.offer(
      {
        callbackURL: `${serviceUrl}/receive/${credentialType}`,
        offeredCredentials: [
          {
            type: offeredType[offeredType.length - 1],
            ...metadata
          }
        ]
      },
      password
    )

    const token = credOffer.encode()
    await setStatusPending(redis, credOffer.nonce, { request: token })
    return res.send({ token, identifier: credOffer.nonce })
  } catch (err) {
    return res.status(500).send({ error: err.message })
  }
}

const consumeCredentialOfferResponse = (
  identityWallet: IdentityWallet,
  redis: RedisApi
) => async (req: RequestWithInteractionTokens, res: Response) => {
  const { credentialType } = req.params

  if (!credentialType || !credentialOffers[credentialType]) {
    return res.status(401).send('Requested credential type is not supported')
  }

  const credentialOfferResponse = req.userResponseToken
  const claim = await getDataFromUiForms(redis, credentialOfferResponse.nonce)

  const credential = await identityWallet.create.signedCredential(
    {
      metadata: credentialOffers[credentialType],
      claim,
      subject: keyIdToDid(credentialOfferResponse.issuer)
    },
    password
  )

  const credentialReceive = await identityWallet.create.interactionTokens.response.issue(
    {
      signedCredentials: [credential.toJSON()]
    },
    password,
    credentialOfferResponse
  )

  await setStatusDone(redis, credentialOfferResponse.nonce)
  return res.json({ token: credentialReceive.encode() })
}

export const issuance = {
  generateCredentialOffer,
  consumeCredentialOfferResponse
}
