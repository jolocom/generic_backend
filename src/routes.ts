import * as path from 'path'
import {Express} from 'express'
import {IdentityWallet} from 'jolocom-lib/js/identityWallet/identityWallet'
import {registration} from './controllers/registration'
import {issuance} from './controllers/issuance'
import {RedisApi} from './types'
// import {RedisApi} from './types'

export const configureRoutes = (
  app: Express,
  redis: RedisApi,
  identityWallet: IdentityWallet
) => {
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  })

  app.get('/assets/:name', (req, res) => {
    const {name} = req.params
    res.sendFile(path.join(__dirname, `../dist/img/${name}`))
  })

  app
  .route('/authenticate')
  .get((req, res) => registration.generateCredentialShareRequest(identityWallet, redis, req, res))
  .post((req, res) => registration.consumeCredentialShareResponse(identityWallet, redis, req, res))

  app
  .route('/receive')
  .get((req, res) => issuance.generateCredentialOffer(identityWallet, redis, req, res))
  .post((req, res) => issuance.consumeCredentialOfferResponse(identityWallet, redis, req, res))
}
