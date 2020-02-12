import { BaseMetadata, claimsMetadata } from 'cred-types-jolocom-core'
import { ICredentialReqSection } from './types'
import { config } from 'dotenv'
import { validateEmailCredential } from './helpers/validators'
import {
  CredentialOfferRenderInfo,
  CredentialOfferMetadata
} from 'jolocom-lib/js/interactionTokens/interactionTokens.types'

config()

/**
 * The seed to instantiate a vaulted key provider and password for seed encryption / decryption
 * The need to persist the seed in clear text will be addressed in the next minor release
 */

export const keyToDid = (key: string) => key.slice(0, key.indexOf('#'))

export const seed = Buffer.from(process.env.SEED, 'hex')

export const password = process.env.PASSWORD

export const port = process.env.PORT

/* Where is your service deployed. E.g. https://demo-sso.jolocom.com, used by the frontend */
// export const serviceUrl = 'papyri:/'
export const serviceUrl = 'papyri:/'

/* Credentials required during authentication */
export const currentCredentialRequirements = ['e-mail']

/* Credentials offered to users */
export const credentialRequirements = {
  'e-mail': {
    metadata: claimsMetadata.emailAddress,
    credentialValidator: validateEmailCredential(['@jolocom.com'])
  }
} as { [key: string]: ICredentialReqSection }

/* Credentials offered by the service. Documentation on how to include custom credentials coming soon */
export const credentialOffers = {} as {
  [key: string]: {
    schema: BaseMetadata
    metadata: {
      renderInfo?: CredentialOfferRenderInfo
      metadata?: CredentialOfferMetadata
    }
  }
}

export const bookList = [
  9781623170745,
  9781937146580,
  9780990489177,
  9781719127141,
  9781523930470,
  9780393634990,
  9780198739838,
  9780062018205,
  9780241957219,
  9780465094257,
  9780316508278,
  9780262029575,
  9781787330672,
  9781250107817,
  9781260026672
]
