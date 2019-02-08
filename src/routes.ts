import {Express} from 'express'
import {IdentityWallet} from 'jolocom-lib/js/identityWallet/identityWallet'
import {registration} from './controllers/registration'
import {issuance} from './controllers/issuance'
import {RedisApi} from './types'

export const configureRoutes = (
  app: Express,
  redis: RedisApi,
  identityWallet: IdentityWallet
) => {
  app.route('/authenticate/')
  .get((req, res) => registration.generateCredentialShareRequest(identityWallet, redis, req, res))
  .post((req, res) => registration.consumeCredentialShareResponse(identityWallet, redis, req, res))

  app.route('/receive/')
  .get((req, res) => issuance.generateCredentialOffer(identityWallet, req, res))
  .post((req, res) => issuance.consumeCredentialOfferResponse(identityWallet, redis, req, res))
}
