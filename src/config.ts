import { BaseMetadata } from 'cred-types-jolocom-core'
import { claimsMetadata as demoClaimsMetadata } from 'cred-types-jolocom-demo'
import { ICredentialReqSection } from './types'
import { config } from 'dotenv';

config();

/**
 * The seed to instantiate a vaulted key provider and password for seed encryption / decryption
 * The need to persist the seed in clear text will be addressed in the next minor release
 */
export const seed = Buffer.from(
  process.env.SEED,
  'hex'
)

export const password = process.env.PASSWORD;

/* Where is your service deployed. E.g. https://demo-sso.jolocom.com, used by the frontend */
export const serviceUrl = 'http://192.168.2.109:9000'

/* Credentials required during authentication */
export const currentCredentialRequirements = ['a-kaart']

/* Credentials offered to users */
export const credentialRequirements = {
  'a-kaart': {
    metadata: demoClaimsMetadata.akaart
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
];
