import { Request } from 'express'
import {
  JSONWebToken,
  JWTEncodable
} from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { BaseMetadata } from 'cred-types-jolocom-demo'
import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential'

export interface RedisApi {
  setAsync: (key: string, value: string, timeout?: number) => Promise<void>
  getAsync: (key: string) => Promise<string>
  delAsync: (key: string) => Promise<void>
}

export interface RequestWithInteractionTokens extends Request {
  userResponseToken: JSONWebToken<JWTEncodable>
  serviceRequestToken: JSONWebToken<JWTEncodable>
  middlewareData?: {
    [key: string]: any
  }
}

export interface ICredentialReqSection {
  metadata: BaseMetadata
  issuer?: string
  credentialValidator?: (cred: SignedCredential) => boolean
}
