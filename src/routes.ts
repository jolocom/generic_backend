import { Express } from 'express'
import { registration } from './controllers/registration'
import { issuance } from './controllers/issuance'
import { authentication } from './controllers/authentication'
import { RedisApi } from './types'
import { Endpoints } from './sockets'
import { addCustomAuthnMiddleware } from './customHandlers/customMiddleware'
import { Agent } from '@jolocom/sdk'

export const configureDefaultRoutes = (
  app: Express,
  redis: RedisApi,
  agent: Agent
) => {
  app
    .route(Endpoints.share)
    .get(registration.generateCredentialShareRequest(agent, redis))
    .post(
      registration.consumeCredentialShareResponse(agent, redis),
      addCustomAuthnMiddleware(agent, redis)
    )

  app
    .route(Endpoints.receive)
    .get(issuance.generateCredentialOffer(agent, redis))
    .post(
      issuance.consumeCredentialOfferResponse(agent, redis)
    )

  app
    .route(Endpoints.auth)
    .get(authentication.generateAuthenticationRequest(agent, redis))
    .post(
      authentication.consumeAuthenticationResponse(agent, redis)
    )
}
