import {password} from '../../config'
import {ControllerArguments} from './registration'
import {Response, Request} from 'express'

const generateCredentialOffer = async (
  options: ControllerArguments,
  req: Request,
  res: Response
) => {
  const {identityWallet} = options

  try {
    const credOffer = await identityWallet.create.interactionTokens.request.offer(
      {
        callbackURL: '/receive/',
        requestedInput: {},
        instant: true
      },
      password
    )

    return res.status(200).send({token: credOffer.encode()})
  } catch (err) {
    return res.status(500).send({error: err.message})
  }
}

const consumeCredentialOfferResponse = async (
  options: ControllerArguments,
  req: Request,
  res: Response
) => {
  console.log('YES')
}

export const issuance = {
  generateCredentialOffer,
  consumeCredentialOfferResponse
}
