import {Request} from 'express'
import {JSONWebToken, JWTEncodable} from 'jolocom-lib/js/interactionTokens/JSONWebToken'

export interface RedisApi {
  setAsync: (key: string, value: string) => Promise<void>
  getAsync: (key: string) => Promise<string>
  delAsync: (key: string) => Promise<void>
}

export interface RequestWithInteractionTokens extends Request {
  interactionToken: JSONWebToken<JWTEncodable>,
  requestToken: JSONWebToken<JWTEncodable>
}
