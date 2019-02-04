/**
 * The seed to instantiate a vaulted key provider and password for seed encryption / decryption
 * The need to persist the seed in clear text will be addressed in the next minor release
 */
import { claimsMetadata } from "cred-types-jolocom-core";
import { BaseMetadata } from "cred-types-jolocom-demo";

export const seed = Buffer.from(
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "hex"
);
export const password = "correct horse battery staple";

/* Where is your service deployed. E.g. https://demo-sso.jolocom.com, used by the frontend */
export const serviceUrl = "http://localhost:9000";

/* What credentials do you require during authentication, and associated constraints */
export const credentialRequirements = [
  {
    name: 'Email',
    type: ["Credential", "ProofOfEmailCredential"],
    issuer: "did:jolo:b2d5d8d6cc140033419b54a237a5db51710439f9f462d1fc98f698eca7ce9777"
  }
];

/*
 * name: 'Email'
 * requestedClaimFields: []
 */

export const credentialOffer = {
  email: claimsMetadata.emailAddress,
  name: claimsMetadata.name
} as { [key: string]: BaseMetadata };
