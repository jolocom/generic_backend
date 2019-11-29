import { CredentialResponse } from 'jolocom-lib/js/interactionTokens/credentialResponse'
import { constraintFunctions } from 'jolocom-lib/js/interactionTokens/credentialRequest'
import { IConstraint } from 'jolocom-lib/js/interactionTokens/interactionTokens.types'
import { ICredentialReqSection, RedisApi } from '../types'

export const extractDataFromClaims = (
  credentialResponse: CredentialResponse
) => {
  const reserved = ['id']
  const accumulatedData = credentialResponse.suppliedCredentials.reduce(
    (acc, credential) => ({ ...acc, ...credential.claim }),
    {}
  ) as { [k: string]: string }

  return Object.keys(accumulatedData)
    .filter(key => !reserved.includes(key))
    .reduce((acc, key) => ({ ...acc, [key]: accumulatedData[key] }), {})
}

export const generateRequirementsFromConfig = ({
  issuer,
  metadata
}: ICredentialReqSection) => ({
  type: metadata.type,
  constraints: (issuer
    ? [constraintFunctions.is('issuer', issuer)]
    : []) as IConstraint[]
})

export const setStatus = time => (redis: RedisApi, key: string, data: any) =>
  redis.setAsync(key, JSON.stringify({ ...data, status: 'pending' }), time)

export const setStatusPending = setStatus(60 * 60)

export const setStatusDone = (redis: RedisApi, key: string, data: any = {}) =>
  redis.setAsync(key, JSON.stringify({ ...data, status: 'success' }), 60 * 60)

export const setDataFromUiForms = (
  redis: RedisApi,
  key: string,
  data: string
) => redis.setAsync(`${key}_formData`, data || '{}')

export const getDataFromUiForms = async (redis: RedisApi, key: string) => {
  const derivedKey = `${key}_formData`
  const data = await redis.getAsync(derivedKey)

  await redis.delAsync(derivedKey)

  return data ? JSON.parse(data) : {}
}
