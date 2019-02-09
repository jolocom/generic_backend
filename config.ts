import { claimsMetadata, BaseMetadata } from "cred-types-jolocom-core";
import {claimsMetadata as demoClaimsMetadata} from 'cred-types-jolocom-demo'

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
export const serviceUrl = "http://192.168.2.109:9000";

/* Credentials required during authentication */
export const credentialRequirements = [
  {
    metadata: claimsMetadata.emailAddress,
    issuer: '' // A did can be included here to whitelist the issuer of the requested credential
  },
  {
    metadata: claimsMetadata.mobilePhoneNumber // If the field is empty, or omitted, any issuer will be accepted
  }
];

/* Credentials offered by the service. Documentation on how to include custom credentials coming soon */
export const credentialOffers = {
  email: claimsMetadata.emailAddress,
  name: claimsMetadata.name,
  'id-card': demoClaimsMetadata.demoId,
  'a-kaart': demoClaimsMetadata.akaart
} as { [key: string]: BaseMetadata };
