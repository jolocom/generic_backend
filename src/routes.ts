import {Express, NextFunction, Request, Response} from 'express'
import {IdentityWallet} from 'jolocom-lib/js/identityWallet/identityWallet'
import {registration} from './controllers/registration'
import {issuance} from './controllers/issuance'
import {RedisApi} from './types'
import {Endpoints} from './sockets'
import {JolocomLib} from 'jolocom-lib'

export const configureRoutes = (
  app: Express,
  redis: RedisApi,
  identityWallet: IdentityWallet
) => {
  app.route(Endpoints.authn)
  .get((req, res) => registration.generateCredentialShareRequest(identityWallet, redis, res))
  .post(validateSentInteractionToken, matchAgainstRequest(redis), (req, res) => registration.consumeCredentialShareResponse(redis, req, res))

  app.route(`${Endpoints.receive}:credentialType`)
  .get((req, res) => issuance.generateCredentialOffer(identityWallet, redis, req, res))
  .post(validateSentInteractionToken, matchAgainstRequest(redis), (req, res) => issuance.consumeCredentialOfferResponse(identityWallet, redis, req, res))
}

const validateSentInteractionToken = async (req: Request, res:Response, next: NextFunction) => {
  try {
    const interactionToken = await JolocomLib.parse.interactionToken.fromJWT(req.body.token)

    if (!JolocomLib.util.validateDigestable(interactionToken)) {
      return res.status(401).send('Invalid signature on interaction token')
    }

    // @ts-ignore
    req.interactionToken = interactionToken
    return next()
  } catch (err) {
    return res.status(401).send(`Could not parse interaction token - ${err.message}`)
  }
}

const matchAgainstRequest = (redis: RedisApi) => async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const sentRequestJWT = await redis.getAsync(req.interactionToken.nonce)

  if (!sentRequestJWT) {
    return res.status(401).send('No request token found')
  }

  const { request: requestToken} = JSON.parse(sentRequestJWT)

  try {
    // @ts-ignore
    req.requestToken = JolocomLib.parse.interactionToken.fromJWT(requestToken)
  } catch (err) {
    return res.status(401).send(`Failed to decode request token - ${err.message}`)
  }

  return next()
}
