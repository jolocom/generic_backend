import { CredentialResponse } from "jolocom-lib/js/interactionTokens/credentialResponse";
import { constraintFunctions } from "jolocom-lib/js/interactionTokens/credentialRequest";
import { IConstraint } from "jolocom-lib/js/interactionTokens/interactionTokens.types";
import { ICredentialReqSection, RedisApi } from "../types";
import { SignedCredential } from "jolocom-lib/js/credentials/signedCredential/signedCredential";
import { credentialRequirements } from "../../config";

const { validate } = require("email-validator");

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

export const generateRequirementsFromConfig = ({
  issuer,
  metadata
}: ICredentialReqSection) => ({
  type: metadata.type,
  constraints: (issuer
    ? [constraintFunctions.is("issuer", issuer)]
    : []) as IConstraint[]
});

export const setStatusPending = (redis: RedisApi, key: string, data: any) =>
  redis.setAsync(key, JSON.stringify({ ...data, status: "pending" }));

export const setStatusDone = (redis: RedisApi, key: string, data: any = {}) =>
  redis.setAsync(key, JSON.stringify({ ...data, status: "success" }));

export const setDataFromUiForms = (
  redis: RedisApi,
  key: string,
  data: string
) => redis.setAsync(`${key}_formData`, data);

export const getDataFromUiForms = async (redis: RedisApi, key: string) => {
  const derivedKey = `${key}_formData`;
  const data = JSON.parse(await redis.getAsync(derivedKey)) || {};

  await redis.delAsync(derivedKey);

  return data;
};

// TODO test this better
export const applyValidationFunction = (credential: SignedCredential) => {
  const { credentialValidator } = Object.values(credentialRequirements).find(
    ({ metadata }) => areArraysEqual(metadata.type, credential.type)
  );

  if (!credentialValidator) {
    return true;
  }

  return credentialValidator(credential);
};

export const validateEmailCredential = (whitelistedValues: string[]) => ({
  claim
}: {
  claim: { [key: string]: string };
}) =>
  whitelistedValues.some(allowed =>
    allowed.startsWith("@")
      ? validate(claim.email) && claim.email.endsWith(allowed)
      : whitelistedValues.includes(claim.email)
  );

export const areArraysEqual = (first: string[], second: string[]) => {
  if (first.length !== second.length) {
    return false;
  }

  return first.every((el, i) => el === second[i]);
};
