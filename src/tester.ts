import { JolocomLib } from 'jolocom-lib'
import { password, seed, serviceUrl } from './config'
import axios, { AxiosResponse } from 'axios'
import { claimsMetadata } from 'cred-types-jolocom-core'
import { Endpoints } from './sockets'
import { JSONWebToken } from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { CredentialOfferRequest } from 'jolocom-lib/js/interactionTokens/credentialOfferRequest'
import { CredentialRequest } from 'jolocom-lib/js/interactionTokens/credentialRequest'
import { CredentialsReceive } from 'jolocom-lib/js/interactionTokens/credentialsReceive'

const getIdentityWallet = async () => {
  const registry = JolocomLib.registries.jolocom.create()
  const vaultedKeyProvider = JolocomLib.KeyProvider.fromSeed(seed, password)

  return registry.authenticate(vaultedKeyProvider, {
    derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
    encryptionPass: password
  })
}

export const testCredentialReceive = async () => {
  const identityWallet = await getIdentityWallet()

  const { token } = (await axios.get(
    `${serviceUrl}${Endpoints.receive}testerBadge`
  )).data

  const credentialOffer: JSONWebToken<
    CredentialOfferRequest
  > = JolocomLib.parse.interactionToken.fromJWT(token)

  const offerResponse = await identityWallet.create.interactionTokens.response.offer(
    {
      callbackURL: credentialOffer.interactionToken.callbackURL,
      selectedCredentials: [
        {
          type: credentialOffer.interactionToken.offeredTypes[0]
        }
      ]
    },
    password,
    JolocomLib.parse.interactionToken.fromJWT(token)
  )

  return axios
    .post(credentialOffer.interactionToken.callbackURL, {
      token: offerResponse.encode()
    })
    .catch(err => console.log(err))
}

export const testCredentialRequest = async () => {
  const identityWallet = await getIdentityWallet()

  const { token } = (await axios.get(`${serviceUrl}${Endpoints.authn}`)).data
  const credentialRequest: JSONWebToken<
    CredentialRequest
  > = JolocomLib.parse.interactionToken.fromJWT(token)

  const cred = await identityWallet.create.signedCredential(
    {
      subject: identityWallet.did,
      claim: {
        email: 'test@jolocom.com'
      },
      metadata: claimsMetadata.emailAddress
    },
    password
  )

  const credentialResponse = await identityWallet.create.interactionTokens.response.share(
    {
      suppliedCredentials: [cred.toJSON()],
      callbackURL: credentialRequest.interactionToken.callbackURL
    },
    password,
    credentialRequest
  )

  return axios
    .post(credentialRequest.interactionToken.callbackURL, {
      token: credentialResponse.encode()
    })
    .catch(err => console.log(err))
}

testCredentialRequest().then((res: AxiosResponse) =>
  console.log(`Sign in status code: ${res.status}`)
)

testCredentialReceive()
  .then((res: AxiosResponse) => {
    const credentials = JolocomLib.parse.interactionToken.fromJWT<
      CredentialsReceive
    >(res.data.token).interactionToken.signedCredentials
    console.log('Received credentials: ', credentials)
  })
  .catch(err => console.log(err))
