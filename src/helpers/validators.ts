import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential'
import { credentialRequirements } from '../config'
const { validate: validateEmail } = require('email-validator')

// TODO test this better
export const applyValidationFunction = (credential: SignedCredential) => {
  const { credentialValidator } = Object.values(credentialRequirements).find(
    ({ metadata }) => areArraysEqual(metadata.type, credential.type)
  )

  if (!credentialValidator) {
    return true
  }

  return credentialValidator(credential)
}

export const validateEmailCredential = (whitelistedValues: string[]) => ({
  claim
}: {
  claim: { [key: string]: string }
}) =>
  whitelistedValues.some(allowed =>
    validateEmail(claim.email) && (
      allowed.startsWith('@')
        ? claim.email.endsWith(allowed)
        : whitelistedValues.includes(claim.email)
    )
  )

export const areArraysEqual = (first: string[], second: string[]) => {
  if (first.length !== second.length) {
    return false
  }

  return first.every((el, i) => el === second[i])
}
