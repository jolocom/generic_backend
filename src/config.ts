import { BaseMetadata, claimsMetadata } from 'cred-types-jolocom-core'
import { ICredentialReqSection } from './types'
import {
  CredentialOfferMetadata,
  CredentialOfferRenderInfo,
  CredentialRenderTypes
} from 'jolocom-lib/js/interactionTokens/interactionTokens.types'
import { JolocomLib } from 'jolocom-lib'

export { graphs } from './graphs'

/**
 * The seed to instantiate a vaulted key provider and password for seed encryption / decryption
 * The need to persist the seed in clear text will be addressed in the next minor release
 */
export const seed = Buffer.from(
 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbccccccccccc',
 'hex'
)

export const password = 'giraffe deploy browser table'

/* Where is your service deployed. E.g. https://demo-sso.jolocom.com, used by the frontend */
export const serviceUrl = 'https://8035286d.ngrok.io'

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
  accessKey: {
    schema: {
      type: ['Credential', 'AccessKey'],
      context: [
          {
              token: 'schema:ticketToken',
              schema: 'https://schema.org/'
          }
      ],
      claimInterface: {
        token: ''
      },
      name: 'Access Key'
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
            'https://jolocom.io/wp-content/themes/jolocom/images/Solution-hero-mobile.jpg'
        },
        text: {
          color: '#ffffff'
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

const createID = () => {
    const registry = JolocomLib.registries.jolocom.create()
    const vaultedKeyProvider = JolocomLib.KeyProvider.fromSeed(seed, password)

    JolocomLib.util.fuelKeyWithEther(vaultedKeyProvider.getPublicKey({
        derivationPath: JolocomLib.KeyTypes.ethereumKey,
        encryptionPass: password
    }))
    // registry.create(vaultedKeyProvider, password)
}
// createID()

const configurePublicProfile = (serviceName: string, desc: string) => {
    const registry = JolocomLib.registries.jolocom.create()
    const vaultedKeyProvider = JolocomLib.KeyProvider.fromSeed(seed, password)

    registry
        .authenticate(vaultedKeyProvider, {
            derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
            encryptionPass: password
        })
        .then(async identityWallet => ({
            idw: identityWallet,
            cred: await identityWallet.create.signedCredential({
                metadata: claimsMetadata.publicProfile,
                claim: {
                    name: serviceName,
                    description: desc,
                },
                subject: identityWallet.did
            }, password)

        }))
        .then(async ({idw, cred}) => {
            idw.identity.publicProfile = cred
            await registry.commit({
                vaultedKeyProvider,
                keyMetadata: {
                    encryptionPass: password,
                    derivationPath: JolocomLib.KeyTypes.ethereumKey
                },
                identityWallet: idw
            })
        })

}

configurePublicProfile('Company 1', 'We provide Access Management')
