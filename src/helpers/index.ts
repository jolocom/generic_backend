import { CredentialResponse } from "jolocom-lib/js/interactionTokens/credentialResponse";
import {constraintFunctions} from 'jolocom-lib/js/interactionTokens/credentialRequest'
import {IConstraint} from 'jolocom-lib/js/interactionTokens/interactionTokens.types'
import {RedisApi} from '../types'

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

export const generateRequirementsFromConfig = (credentialRequierements: any) =>
  credentialRequierements.map(({metadata, issuer }: any) => ({
    type: metadata.type,
    constraints: (issuer
      ? [constraintFunctions.is("issuer", issuer)]
      : []) as IConstraint[]
  }));

export const setStatusPending = (redis: RedisApi, key: string, data: any) =>
  redis.setAsync(key, JSON.stringify({...data, status: 'pending'}));

export const setStatusDone = (redis: RedisApi, key: string, data: any = {}) =>
  redis.setAsync(key, JSON.stringify({...data, status: 'success'}));

export const setDataFromUiForms = (redis: RedisApi, key: string, data: string) =>
  redis.setAsync(`${key}_formData`, data);

export const getDataFromUiForms = async (redis: RedisApi, key: string) => {
  const derivedKey = `${key}_formData`
  const data = JSON.parse(await redis.getAsync(derivedKey)) || {}

  await redis.delAsync(derivedKey)

  return data
}
