import { BaseMetadata, claimsMetadata } from 'cred-types-jolocom-core'
import { ICredentialReqSection } from './types'
import {
  CredentialOfferMetadata,
  CredentialOfferRenderInfo,
  CredentialRenderTypes
} from 'jolocom-lib/js/interactionTokens/interactionTokens.types'
import { validateEmailCredential } from './helpers/validators'

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
export const serviceUrl = process.env.SERVICE_URL || 'http://localhost:9000'

const genericRenderInfo = {
  logo: {
    url: 'https://miro.medium.com/fit/c/240/240/1*jbb5WdcAvaY1uVdCjX1XVg.png'
  },
  background: {
    url:
      'https://imgix.bustle.com/rehost/2016/9/13/19d26bb8-4115-43ac-b970-2a7f75924d0f.jpg?w=970&h=546&fit=crop&crop=faces&auto=format&q=70'
  },
  text: {
    color: '#ffffff'
  },
  renderAs: CredentialRenderTypes.document
}

/* Credentials offered by the service. Documentation on how to include custom credentials coming soon */
export const credentialOffers = {
  FirstCredential: {
    schema: {
      type: ['Credential', 'FirstCredential'],
      context: [],
      claimInterface: {
        message: 'Hey Arnold!'
      },
      name: 'First Credential'
    },
    requestedInput: {}, // currently not used
    metadata: {
      renderInfo: {
        ...genericRenderInfo,
        background: {
          url:
            'https://imgix.bustle.com/rehost/2016/9/13/19d26bb8-4115-43ac-b970-2a7f75924d0f.jpg?w=970&h=546&fit=crop&crop=faces&auto=format&q=70'
        }
      },
      metadata: {
        asynchronous: false // currently not used
      }
    }
  },
  SecondCredential: {
    schema: {
      type: ['Credential', 'SecondCredential'],
      context: [],
      claimInterface: {
        message: 'AAAHH!!!'
      },
      name: 'Second Credential'
    },
    requestedInput: {}, // currently not used
    metadata: {
      renderInfo: {
        ...genericRenderInfo,
        background: {
          url:
            'https://imgix.bustle.com/rehost/2016/9/13/52e2a893-1b56-4101-814c-0c0238062b4a.png?w=970&h=546&fit=crop&crop=faces&auto=format&q=70'
        },
        metadata: {
          asynchronous: false // currently not used
        }
      }
    }
  },
  ThirdCredential: {
    schema: {
      type: ['Credential', 'ThirdCredential'],
      context: [],
      claimInterface: {
        message: 'AAAHH!!!'
      },
      name: 'Third Credential'
    },
    requestedInput: {}, // currently not used
    metadata: {
      renderInfo: {
        ...genericRenderInfo,
        background: {
          url:
            'https://cdn.pocket-lint.com/r/s/1200x/assets/images/150078-tv-news-netflix-and-nickelodeon-are-joining-forces-to-take-on-disney-with-original-shows-and-films-image1-tejqimvk4n.jpg'
        },
        metadata: {
          asynchronous: false // currently not used
        }
      }
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

/* Credentials required during authentication */
// export const currentCredentialRequirements = ['email', 'SecondCredential']

// TODO @clauxx is this a typo? (credentials requested from the users)
/* Credentials offered to users */
export const credentialRequirements = {
  email: {
    metadata: claimsMetadata.emailAddress
    // example email validation with specific domains
    // credentialValidator: validateEmailCredential(['@jolocom.com', '@jolocom.io']),
    // or with specific emails
    // credentialValidator: validateEmailCredential(['dev@jolocom.com'])
    // or just any valid email
    // credentialValidator: validateEmailCredential()
  },
  FirstCredential: {
    metadata: {
      ...credentialOffers.FirstCredential.schema
    }
  },
  SecondCredential: {
    metadata: {
      ...credentialOffers.SecondCredential.schema
    }
  },
  ThirdCredential: {
    metadata: {
      ...credentialOffers.ThirdCredential.schema
    }
  }
} as { [key: string]: ICredentialReqSection }
