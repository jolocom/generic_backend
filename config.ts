import { claimsMetadata, BaseMetadata } from "cred-types-jolocom-core";
import { claimsMetadata as demoClaimsMetadata } from "cred-types-jolocom-demo";
import {ICredentialReqSection} from './src/types'
import {validateEmailCredential} from './src/helpers'

/**
 * The seed to instantiate a vaulted key provider and password for seed encryption / decryption
 * The need to persist the seed in clear text will be addressed in the next minor release
 */
export const seed = Buffer.from(
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "hex"
);
export const password = "correct horse battery staple";

/* Where is your service deployed. E.g. https://demo-sso.jolocom.com, used by the frontend */
export const serviceUrl = "http://localhost:9000";
export const frontendUrl = "http://localhost:3000"

/* Credentials required during authentication */

export const currentCredentialRequirements = ['a-kaart']

export const credentialRequirements = {
  email: {
    metadata: claimsMetadata.emailAddress,
    credentialValidator: validateEmailCredential(['@antwerpen.be']),
  },
  'a-kaart': {
    metadata: demoClaimsMetadata.akaart,
    issuer: "did:jolo:b2d5d8d6cc140033419b54a237a5db51710439f9f462d1fc98f698eca7ce9777" // Can be used to whitelist the issuer of requested credential. If empty, or omitted, all issuers are accepted
  },
  'driver-license': {
    metadata: demoClaimsMetadata.demoDriversLicence,
  }
} as {[key: string]: ICredentialReqSection};

/* Credentials offered by the service. Documentation on how to include custom credentials coming soon */
export const credentialOffers = {
  'mobile-number': claimsMetadata.mobilePhoneNumber
} as { [key: string]: BaseMetadata };
