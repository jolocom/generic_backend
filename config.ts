import { BaseMetadata } from "cred-types-jolocom-core";
import { claimsMetadata as demoClaimsMetadata } from "cred-types-jolocom-demo";
import { ICredentialReqSection } from "./src/types";

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
export const frontendUrl = "http://192.168.2.109:3000";

/* Credentials required during authentication */

export const currentCredentialRequirements = ["a-kaart"];

export const credentialRequirements = {
  "a-kaart": {
    metadata: demoClaimsMetadata.akaart
  }
} as { [key: string]: ICredentialReqSection };

/* Credentials offered by the service. Documentation on how to include custom credentials coming soon */
export const credentialOffers = {} as { [key: string]: BaseMetadata };
