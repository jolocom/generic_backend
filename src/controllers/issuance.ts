import { credentialOffers, password, serviceUrl } from '../config'
import { Request, Response } from 'express'
import { IdentityWallet } from 'jolocom-lib/js/identityWallet/identityWallet'
import { RedisApi, RequestWithInteractionTokens } from '../types'
import { keyIdToDid } from 'jolocom-lib/js/utils/helper'
import {
  getDataFromUiForms,
  setStatusDone,
  setStatusPending,
  areTypesAvailable
} from '../helpers'
import { JSONWebToken } from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { CredentialOfferResponse } from 'jolocom-lib/js/interactionTokens/credentialOfferResponse'
import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential'

const generateCredentialOffer = (
  identityWallet: IdentityWallet,
  redis: RedisApi
) => async (req: Request, res: Response) => {
  const queryTypes: string[] = req.query.types.split(',')
  const invalidTypes: string[] | undefined =
    req.query.invalid && req.query.invalid.split(',')
  const callbackURL = invalidTypes
    ? `${serviceUrl}/receive?invalid=${invalidTypes.join()}`
    : `${serviceUrl}/receive`

  if (!areTypesAvailable(queryTypes, credentialOffers)) {
    return res.status(500).send({ error: 'Credential Type not found' })
  }

  try {
    const credOffer = await identityWallet.create.interactionTokens.request.offer(
      {
        callbackURL,
        offeredCredentials: queryTypes.reduce(
          (acc, offerType) => [
            ...acc,
            {
              type: offerType,
              ...credentialOffers[offerType].metadata
            }
          ],
          []
        )
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
  const credentialOfferResponse = req.userResponseToken as JSONWebToken<
    CredentialOfferResponse
  >
  const selectedOffers =
    credentialOfferResponse.interactionToken.selectedCredentials
  const claim = await getDataFromUiForms(redis, credentialOfferResponse.nonce)

  const selectedTypes = selectedOffers.map(offer => offer.type)
  if (!areTypesAvailable(selectedTypes, credentialOffers)) {
    return res.status(500).send({ error: 'Credential Type not found' })
  }

  const providedCredentials = await Promise.all(
    selectedOffers.reduce<Array<Promise<SignedCredential>>>((acc, offer) => {
      return [
        ...acc,
        identityWallet.create.signedCredential(
          {
            metadata: credentialOffers[offer.type].schema,

            claim: { ...claim, message: 'Thank you for testing the endpoint' },
            subject: keyIdToDid(credentialOfferResponse.issuer)
          },
          password
        )
      ]
    }, [])
  )

  const invalidTypes: string[] | undefined =
    req.query.invalid && req.query.invalid.split(',')
  if (invalidTypes) {
    invalidTypes.map(type => {
      const credential = providedCredentials.find(
        cred => cred.type[cred.type.length - 1] === type
      )
      if (credential) credential.subject = 'wrong'
    })
  }

  const credentialReceive = await identityWallet.create.interactionTokens.response.issue(
    {
      signedCredentials: providedCredentials.map(cred => cred.toJSON())
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
