import { Express } from "express";
import { IdentityWallet } from "jolocom-lib/js/identityWallet/identityWallet";
import { registration } from "./controllers/registration";
import { issuance } from "./controllers/issuance";
import { RedisApi } from "./types";
import { Endpoints } from "./sockets";
import {
  matchAgainstRequest, validateCredentialsAgainstRequest,
  validateSentInteractionToken
} from './middleware'

export const configureRoutes = (
  app: Express,
  redis: RedisApi,
  identityWallet: IdentityWallet
) => {
  app
    .route(Endpoints.authn)
    .get(registration.generateCredentialShareRequest(identityWallet, redis))
    .post(
      validateSentInteractionToken,
      matchAgainstRequest(redis),
      registration.consumeCredentialShareResponse(redis)
    );

  app
    .route(`${Endpoints.receive}:credentialType`)
    .get(issuance.generateCredentialOffer(identityWallet, redis))
    .post(
      validateSentInteractionToken,
      matchAgainstRequest(redis),
      validateCredentialsAgainstRequest,
      issuance.consumeCredentialOfferResponse(identityWallet, redis)
    );
};
