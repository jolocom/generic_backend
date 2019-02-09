import { Express } from "express";
import { IdentityWallet } from "jolocom-lib/js/identityWallet/identityWallet";
import { registration } from "./controllers/registration";
import { issuance } from "./controllers/issuance";
import { RedisApi, RequestWithInteractionTokens } from "./types";
import { Endpoints } from "./sockets";
import {
  matchAgainstRequest,
  validateSentInteractionToken
} from "./middleware";

export const configureRoutes = (
  app: Express,
  redis: RedisApi,
  identityWallet: IdentityWallet
) => {
  app
    .route(Endpoints.authn)
    .get((req, res) =>
      registration.generateCredentialShareRequest(identityWallet, redis, res)
    )
    .post(
      validateSentInteractionToken,
      matchAgainstRequest(redis),
      (req: RequestWithInteractionTokens, res) =>
        registration.consumeCredentialShareResponse(redis, req, res)
    );

  app
    .route(`${Endpoints.receive}:credentialType`)
    .get((req, res) =>
      issuance.generateCredentialOffer(identityWallet, redis, req, res)
    )
    .post(
      validateSentInteractionToken,
      matchAgainstRequest(redis),
      (req: RequestWithInteractionTokens, res) =>
        issuance.consumeCredentialOfferResponse(identityWallet, redis, req, res)
    );
};
