import { BaseMetadata, claimsMetadata } from 'cred-types-jolocom-core'
import { ICredentialReqSection } from './types'
import { validateEmailCredential } from './helpers/validators';

/**
 * The seed to instantiate a vaulted key provider and password for seed encryption / decryption
 * The need to persist the seed in clear text will be addressed in the next minor release
 */
export const seed = Buffer.from(
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  'hex'
)

export const password = 'correct horse battery staple'

/* Where is your service deployed. E.g. https://demo-sso.jolocom.com, used by the frontend */
export const serviceUrl = 'https://60838dbf.ngrok.io'

/* Credentials required during authentication */
export const currentCredentialRequirements = ['email']

/* Credentials offered to users */
export const credentialRequirements = {
  'email': {
    metadata: claimsMetadata.emailAddress,
    credentialValidator: validateEmailCredential(['@jolocom.com'])
  }
} as { [key: string]: ICredentialReqSection }

/* Credentials offered by the service. Documentation on how to include custom credentials coming soon */
export const credentialOffers = {} as { [key: string]: BaseMetadata }
