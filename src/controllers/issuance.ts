import { credentialOffers, serviceUrl } from '../config'
import { Request, Response } from 'express'
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
import { Agent } from '@jolocom/sdk'

const generateCredentialOffer = (
  agent: Agent,
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

    const credOffer = await agent.credOfferToken(
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
      }
    )

  const token = credOffer.encode()

  await setStatusPending(redis, credOffer.nonce, { request: token })
  return res.send({ token, identifier: credOffer.nonce })
}

const consumeCredentialOfferResponse = (
  agent: Agent,
  redis: RedisApi
) => async (req: RequestWithInteractionTokens, res: Response) => {
  const offerInteraction = await agent.processJWT(req.body.token!)

  // @ts-ignore
  const selectedTypes = offerInteraction.getSummary().state.selectedTypes! as string[]
  const claim = await getDataFromUiForms(redis, offerInteraction.id)

  if (!areTypesAvailable(selectedTypes, credentialOffers)) {
    return res.status(500).send({ error: 'Credential Type not found' })
  }

  const providedCredentials = await Promise.all(
    selectedTypes.map((typ: string) =>
        agent.signedCredential({
            metadata: credentialOffers[typ].schema,
            claim: { ...claim, message: 'Thank you for testing the endpoint' },
            subject: offerInteraction.participants.responder.did
        })
    )
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


  const credentialReceive = await offerInteraction.createCredentialReceiveToken(
    providedCredentials
  )

  await setStatusDone(redis, offerInteraction.id)
  return res.json({ token: credentialReceive.encode() })
}

export const issuance = {
  generateCredentialOffer,
  consumeCredentialOfferResponse
}
