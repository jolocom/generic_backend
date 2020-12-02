import { Express } from 'express'
import { registration } from './controllers/registration'
import { issuance } from './controllers/issuance'
import { Endpoints } from './sockets'
import { addCustomAuthnMiddleware } from './customHandlers/customMiddleware'
import { Agent } from '@jolocom/sdk'

export const configureDefaultRoutes = (
  app: Express,
  agent: Agent
) => {
  app
    .route(Endpoints.authn)
    .get(registration.generateCredentialShareRequest(agent))
    .post(
      registration.consumeCredentialShareResponse(agent),
      addCustomAuthnMiddleware(agent)
    )

  app
    .route(`${Endpoints.receive}:credentialType`)
    .get(issuance.generateCredentialOffer(agent))
    .post(
      issuance.consumeCredentialOfferResponse(agent)
    )
}
