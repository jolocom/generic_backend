import { claimsMetadata, BaseMetadata } from "cred-types-jolocom-core";
import { claimsMetadata as demoClaimsMetadata } from "cred-types-jolocom-demo";
import {ICredentialReqSection} from './src/types'

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
export const serviceUrl = "http://1bddbbae.ngrok.io";
export const frontendUrl = "http://jolocom.com"

/* Credentials required during authentication */

export const currentCredentialRequirements = ['a-kaart']

export const credentialRequirements = {
  'a-kaart': {
    metadata: demoClaimsMetadata.akaart,
    issuer: "" // Can be used to whitelist the issuer of requested credential. If empty, or omitted, all issuers are accepted
  },
  'driver-license': {
    metadata: demoClaimsMetadata.demoDriversLicence,
  }
} as {[key: string]: ICredentialReqSection};

/* Credentials offered by the service. Documentation on how to include custom credentials coming soon */
export const credentialOffers = {
  'mobile-number': claimsMetadata.mobilePhoneNumber
} as { [key: string]: BaseMetadata };
