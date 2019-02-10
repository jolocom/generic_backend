import { claimsMetadata, BaseMetadata } from "cred-types-jolocom-core";
import { claimsMetadata as demoClaimsMetadata } from "cred-types-jolocom-demo";
import { validateEmailCredential } from "./src/helpers";
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
export const serviceUrl = "http://192.168.2.109:9000";

/* Credentials required during authentication */
export const credentialRequirements = {
  email: {
    metadata: claimsMetadata.emailAddress,
    issuer: "", // Can be used to whitelist the issuer of requested credential. If empty, or omitted, all issuers are accepted
    credentialValidator: validateEmailCredential(["@antwerpen.be"])
  }
} as {[key: string]: ICredentialReqSection};


/* Credentials offered by the service. Documentation on how to include custom credentials coming soon */
export const credentialOffers = {
  email: claimsMetadata.emailAddress,
  name: claimsMetadata.name,
  "id-card": demoClaimsMetadata.demoId,
  "a-kaart": demoClaimsMetadata.akaart
} as { [key: string]: BaseMetadata };
