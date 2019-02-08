import {credentialOffers, password, serviceUrl} from '../../config'
import {Request, Response} from 'express'
import {IdentityWallet} from 'jolocom-lib/js/identityWallet/identityWallet'
import {RedisApi} from '../types'
import {JolocomLib} from 'jolocom-lib'
import {keyIdToDid} from 'jolocom-lib/js/utils/helper'
import {sendUnauthorizedMessage} from './registration'

const generateCredentialOffer = async (
  identityWallet: IdentityWallet,
  req: Request,
  res: Response
) => {
  try {
    // TODO source from config
    // TODO Move redis logic here, thin socket abstraction.
    const credOffer = await identityWallet.create.interactionTokens.request.offer(
      {
        callbackURL: `${serviceUrl}/receive/`,
        requestedInput: {},
        instant: true
      },
      password
    )

    const token = credOffer.encode()

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

  try {
    const credentialOfferResponse = await JolocomLib.parse.interactionToken.fromJWT(
      responseToken
    );

    // @ts-ignore
    const {credentialType, token: requestToken, ...data} = JSON.parse(await redis.getAsync(credentialOfferResponse.nonce))

    if (!requestToken) {
      sendUnauthorizedMessage(res, "Corresponding request token not found")
    }

    const credentialOffer = await JolocomLib.parse.interactionToken.fromJWT(
      requestToken
    );

    if (!(await JolocomLib.util.validateDigestable(credentialOffer))) {
      sendUnauthorizedMessage(res, "Invalid signature on interaction token")
    }

    const credential = await identityWallet.create.signedCredential({
      metadata: credentialOffers[credentialType],
      claim: {
        ...data
      },
      subject: keyIdToDid(credentialOfferResponse.issuer)
    }, password)

    const credentialReceive = await identityWallet.create.interactionTokens.response.issue(
      {
        signedCredentials: [credential.toJSON()],
      },
      password,
      credentialOfferResponse
    );

    await redis.setAsync(credentialOfferResponse.nonce, JSON.stringify({ status: 'success', data: credentialReceive.encode() }));
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
