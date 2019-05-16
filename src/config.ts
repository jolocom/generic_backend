import { BaseMetadata,
         claimsMetadata} from 'cred-types-jolocom-core'
import { ICredentialReqSection } from './types'
import { config } from 'dotenv'
import { validateEmailCredential } from './helpers/validators';

config()

/**
 * The seed to instantiate a vaulted key provider and password for seed encryption / decryption
 * The need to persist the seed in clear text will be addressed in the next minor release
 */
export const seed = Buffer.from(
    process.env.SEED,
    'hex'
)

export const password = process.env.PASSWORD

export const port = process.env.PORT

/* Where is your service deployed. E.g. https://demo-sso.jolocom.com, used by the frontend */
export const serviceUrl = 'papyri://'

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
export const credentialOffers = {} as { [key: string]: BaseMetadata }

export const bookList = [
    9781623170745,
    9780990489177,
    9783950313949,
    9783039092819,
    9781937146580,
    9781523930470,
    9781719127141
]
