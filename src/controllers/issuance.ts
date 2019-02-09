import {credentialOffers, password, serviceUrl} from '../../config'
import {Request, Response} from 'express'
import {IdentityWallet} from 'jolocom-lib/js/identityWallet/identityWallet'
import {RedisApi} from '../types'
import {JolocomLib} from 'jolocom-lib'
import {keyIdToDid} from 'jolocom-lib/js/utils/helper'
import {sendUnauthorizedMessage} from './registration'
import {getDataFromUiForms, setStatusDone, setStatusPending} from '../helpers'

const generateCredentialOffer = async (
  identityWallet: IdentityWallet,
  redis: RedisApi,
  req: Request,
  res: Response
) => {
  const {credentialType} = req.params

  try {
    // TODO source from config
    const credOffer = await identityWallet.create.interactionTokens.request.offer(
      {
        callbackURL: `${serviceUrl}/receive/${credentialType}`,
        requestedInput: {},
        instant: true
      },
      password
    )

    const token = credOffer.encode()
    await setStatusPending(redis, credOffer.nonce, {token})
    return res.send({ token, identifier: credOffer.nonce });
  } catch (err) {
    return res.status(500).send({error: err.message})
  }
}

const consumeCredentialOfferResponse = async (
  identityWallet: IdentityWallet,
  redis: RedisApi,
  req: Request,
  res: Response
) => {
  const { token: responseToken } = req.body
  const { credentialType } = req.params

  if (!credentialType || !credentialOffers[credentialType]) {
    return sendUnauthorizedMessage(res, "Requested credential type is not supported")
  }

  try {
    const credentialOfferResponse = await JolocomLib.parse.interactionToken.fromJWT(
      responseToken
    );

    // TODO READ AND DELETE
    const { token: requestToken} = JSON.parse(await redis.getAsync(credentialOfferResponse.nonce))
    const claim = await getDataFromUiForms(redis, credentialOfferResponse.nonce)

    if (!requestToken) {
      return sendUnauthorizedMessage(res, "Corresponding request token not found")
    }

    const credentialOffer = await JolocomLib.parse.interactionToken.fromJWT(
      requestToken
    );

    if (!(await JolocomLib.util.validateDigestable(credentialOffer))) {
      return sendUnauthorizedMessage(res, "Invalid signature on interaction token")
    }

    const credential = await identityWallet.create.signedCredential({
      metadata: credentialOffers[credentialType],
      claim,
      subject: keyIdToDid(credentialOfferResponse.issuer)
    }, password)

    const credentialReceive = await identityWallet.create.interactionTokens.response.issue(
      {
        signedCredentials: [credential.toJSON()],
      },
      password,
      credentialOfferResponse
    );

    await setStatusDone(redis, credentialOfferResponse.nonce)
    // await redis.setAsync(credentialOfferResponse.nonce, JSON.stringify({ status: 'success', data: credentialReceive.encode() }));
    return res.json({ token: credentialReceive.encode() });
  } catch (err) {
    console.log(err)
    return res.status(401).send(err.message);
  }
}

export const issuance = {
  generateCredentialOffer,
  consumeCredentialOfferResponse
}
