import { BaseMetadata, claimsMetadata } from 'cred-types-jolocom-core'
import { ICredentialReqSection } from './types'
import {
  CredentialOfferMetadata,
  CredentialOfferRenderInfo,
  CredentialRenderTypes
} from 'jolocom-lib/js/interactionTokens/interactionTokens.types'

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
export const serviceUrl = 'https://23f0b8e4.ngrok.io'

/* Credentials required during authentication */
export const currentCredentialRequirements = ['email']

/* Credentials offered to users */
export const credentialRequirements = {
  email: {
    metadata: claimsMetadata.emailAddress
  }
} as { [key: string]: ICredentialReqSection }

/* Credentials offered by the service. Documentation on how to include custom credentials coming soon */
export const credentialOffers = {
  eid: {
    schema: {
      type: ['Credential', 'EidCredential'],
      context: [],
      claimInterface: {
        EidCredential: 'https://identity.jolocom.com/terms/EidCredential',
        schema: 'https://schema.org/',
        familyName: 'schema:familyName',
        givenName: 'schema:givenName',
        birthDate: 'schema:birthDate',
        birthPlace: 'schema:birthPlace',
        nationality: 'schema:nationality',
        validThrough: 'schema:validThrough',
        documentNumber: 'schema:identifier',
        address: 'schema:streetAddress',
        issuedBy: 'schema:issuedBy'
      },
      name: 'Demo eID'
    },
    requestedInput: {}, // currently not used
    metadata: {
      renderInfo: {
        logo: {
          url:
            'https://miro.medium.com/fit/c/240/240/1*jbb5WdcAvaY1uVdCjX1XVg.png'
        },
        background: {
          url:
            'https://i.imgur.com/0Mrldei.png'
        },
        text: {
          color: '#05050d'
        },
        renderAs: CredentialRenderTypes.document
      },
      metadata: {
        asynchronous: false // currently not used
      },
    }
  }
} as {
  [key: string]: {
    schema: BaseMetadata
    metadata: {
      renderInfo?: CredentialOfferRenderInfo
      metadata?: CredentialOfferMetadata
    }
  }
}
