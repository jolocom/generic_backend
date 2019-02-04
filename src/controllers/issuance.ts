import {credentialOffer, password, serviceUrl} from '../../config'
import {Request, Response} from 'express'
import {IdentityWallet} from 'jolocom-lib/js/identityWallet/identityWallet'
import {RedisApi} from '../types'
import {JolocomLib} from 'jolocom-lib'
import {extractDataFromClaims} from '../helpers'

const generateCredentialOffer = async (
  identityWallet: IdentityWallet,
  redis: RedisApi,
  req: Request,
  res: Response
) => {
  try {
    const credOffer = await identityWallet.create.interactionTokens.request.offer(
      {
        callbackURL: `${serviceUrl}/receive/${req.params.type}`,
        requestedInput: {},
        instant: true
      },
      password
    )

    const token = credOffer.encode()
    await redis.setAsync(credOffer.nonce, token)
    return res.status(200).send({token})
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
  const { type, token } = req.body
  try {
    // const credentialOfferResponse = await JolocomLib.parse.interactionToken.fromJWT(
    //   token
    // );
    //
    // // const providedData = credentialOfferResponse.
    // // const credentialOfferJWT = await redis.getAsync(credentialOfferResponse.nonce);
    //
    // if (!credentialOfferJWT) {
    //   return res.status(401).send("Corresponding request token not found");
    // }
    //
    // const credentialOffer = await JolocomLib.parse.interactionToken.fromJWT(
    //   credentialOfferJWT
    // );
    //
    // if (!(await JolocomLib.util.validateDigestable(credentialOffer))) {
    //   return res.status(401).send("Invalid signature on interaction token");
    // }
    //
    // // await redis.setAsync(
    // //   credentialResponse.nonce,
    // //   JSON.stringify({ status: "success", data })
    // // );
    return res.status(200).send();
  } catch (err) {
    return res.status(401).send(err.message);
  }
  const credential = await identityWallet.create.signedCredential({
    metadata: credentialOffer[type],
    claim: {},
    subject: ''
  }, password)
}

export const issuance = {
  generateCredentialOffer,
  consumeCredentialOfferResponse
}
