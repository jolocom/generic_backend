import * as path from 'path'
import {Express} from 'express'
import {IdentityWallet} from 'jolocom-lib/js/identityWallet/identityWallet'
import {registration} from './controllers/registration'
// import {debug} from './controllers/debug'
import {issuance} from './controllers/issuance'
import {RedisApi} from './types'

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

  app.get('/authenticate:credentialName', (req, res) => registration.generateCredentialShareRequest(identityWallet, redis, req, res))
  app.post('/authenticate', (req, res) => registration.consumeCredentialShareResponse(identityWallet, redis, req, res))

  app
  .route('/receive/:credentialName')
  .get((req, res) => issuance.generateCredentialOffer(identityWallet, redis, req, res))
  .post((req, res) => issuance.consumeCredentialOfferResponse(identityWallet, redis, req, res))

  // app
  //   .route('/debug/credential')
  //   .post((req, res) => debug.generateCredential(identityWallet, req.body.credentialData, res))
  //
  // app
  //   .route('/debug/identity/')
  //   .get((_, res) => debug.createIdentity(res))
  //   .post((req, res) => debug.createIdentity(res, req.body.entropy))
}
