import {credentialRequirements, password} from '../../config'
import {Express, Request, Response} from 'express'
import {extractDataFromClaims} from '../helpers/'
import {IdentityWallet} from 'jolocom-lib/js/identityWallet/identityWallet'
import {JolocomLib} from 'jolocom-lib'

export interface ControllerArguments {
  app: Express;
  identityWallet: IdentityWallet;
  password: string;
}

const generateCredentialShareRequest = async (
  options: ControllerArguments,
  req: Request,
  res: Response
) => {
  const {identityWallet} = options
  const callbackURL = '/authentication'

  const credentialRequest = await identityWallet.create.interactionTokens.request.share(
    {
      callbackURL,
      credentialRequirements
    }, password
  )

  res.send({token: credentialRequest.encode()})
}

const consumeCredentialShareResponse = async (
  options: ControllerArguments,
  req: Request,
  res: Response
) => {
  const {token} = req.body
  const {identityWallet} = options

  try {
    const credentialResponse = await JolocomLib.parse.interactionToken.fromJWT(token)

    if (!(await JolocomLib.util.validateDigestable(credentialResponse))) {
      return res.status(401).send('Invalid signature on interaction token')
    }

    // TODO include | parse this from request
    const credentialRequest = await identityWallet.create.interactionTokens.request.share(
      {
        callbackURL: '/authenticate',
        credentialRequirements
      }, password
    )

    if (!credentialResponse.interactionToken.satisfiesRequest(credentialRequest.interactionToken)) {
      return res.status(401).send('The supplied credentials do not match the types of the requested credentials')
    }

    const userData = {
      ...extractDataFromClaims(credentialResponse.interactionToken),
      did: credentialResponse.issuer,
      status: 'success'
    }
    console.log(userData)

    // await setAsync(
    //   identifier,
    //   JSON.stringify({status: 'success', data: userData})
    // )

    return res.status(200)
  } catch (err) {
    return res.status(401).send(err.message)
  }
}

export const registration = {
  generateCredentialShareRequest,
  consumeCredentialShareResponse
}
