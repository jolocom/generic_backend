import {password} from '../../config'
import {Request, Response} from 'express'
import {IdentityWallet} from 'jolocom-lib/js/identityWallet/identityWallet'
import {RedisApi} from '../types'

const generateCredentialOffer = async (
  identityWallet: IdentityWallet,
  redis: RedisApi,
  req: Request,
  res: Response
) => {
  try {
    const credOffer = await identityWallet.create.interactionTokens.request.offer(
      {
        callbackURL: '/receive/',
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
}

export const issuance = {
  generateCredentialOffer,
  consumeCredentialOfferResponse
}
