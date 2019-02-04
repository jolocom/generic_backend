import { CredentialResponse } from "jolocom-lib/js/interactionTokens/credentialResponse";

export const extractDataFromClaims = (
  credentialResponse: CredentialResponse
) => {
  const reserved = ["id"];
  const accumulatedData = credentialResponse.suppliedCredentials.reduce(
    (acc, credential) => ({ ...acc, ...credential.claim }),
    {}
  ) as { [k: string]: string };

  return Object.keys(accumulatedData)
    .filter(key => !reserved.includes(key))
    .reduce((acc, key) => ({ ...acc, [key]: accumulatedData[key] }), {});
};
