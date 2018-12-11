import {credentialRequirements, password} from '../../config'
import {Request, Response} from 'express'
import {extractDataFromClaims} from '../helpers/'
import {IdentityWallet} from 'jolocom-lib/js/identityWallet/identityWallet'
import {JolocomLib} from 'jolocom-lib'
import {RedisApi} from '../types'
import {JSONWebToken} from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import {CredentialResponse} from 'jolocom-lib/js/interactionTokens/credentialResponse'

const generateCredentialShareRequest = async (
  identityWallet: IdentityWallet,
  redis: RedisApi,
  req: Request,
  res: Response
) => {
  const callbackURL = '/authentication'

  const credentialRequest = await identityWallet.create.interactionTokens.request.share(
    {
      callbackURL,
      credentialRequirements
    }, password
  )

  const token = credentialRequest.encode()
  await redis.setAsync(credentialRequest.nonce, token)
  res.send({token})
}

const consumeCredentialShareResponse = async (
  identityWallet: IdentityWallet,
  redis: RedisApi,
  req: Request,
  res: Response
) => {
  const {token} = req.body

  try {
    const credentialResponse: JSONWebToken<CredentialResponse> = await JolocomLib.parse.interactionToken.fromJWT(token)
    const requestToken = await redis.getAsync(credentialResponse.nonce)
    const credentialRequest = await JolocomLib.parse.interactionToken.fromJWT(requestToken)

    if (!(await JolocomLib.util.validateDigestable(credentialResponse))) {
      return res.status(401).send('Invalid signature on interaction token')
    }

    if (!credentialResponse.interactionToken.satisfiesRequest(credentialRequest.interactionToken)) {
      return res.status(401).send('The supplied credentials do not match the types of the requested credentials')
    }

    const data = {
      ...extractDataFromClaims(credentialResponse.interactionToken),
      did: credentialResponse.issuer,
      status: 'success'
    }

    await redis.setAsync(credentialResponse.nonce, JSON.stringify({status: 'success', data}))
    return res.status(200)
  } catch (err) {
    return res.status(401).send(err.message)
  }
}

export const registration = {
  generateCredentialShareRequest,
  consumeCredentialShareResponse
}
