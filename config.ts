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
export const serviceUrl = "http://ef99c94b.ngrok.io";

/* What credentials do you require during authentication, and associated constraints */
export const credentialRequirements = [
  {
    name: claimsMetadata.emailAddress.name,
    type: claimsMetadata.emailAddress.type,
    issuer: ''
  }
];

export const credentialOffers = {
  email: claimsMetadata.emailAddress,
  name: claimsMetadata.name,
  'id-card': demoClaimsMetadata.demoId,
  'a-kaart': demoClaimsMetadata.akaart
} as { [key: string]: BaseMetadata };
