import { SSO } from 'jolocom-lib/js/sso/sso'
import * as io from 'socket.io'
import { frontendUrl, serviceUrl } from './config'
import * as http from 'http'
import { DbWatcher } from './dbWatcher'
import { RedisApi } from './types'
import axios from 'axios'
import { Socket } from 'socket.io'
import { setDataFromUiForms } from './helpers'

export enum SocketEvents {
  qrCode = 'qrCode',
  connection = 'connection'
}

export enum Endpoints {
  authn = '/authenticate/',
  receive = '/receive/'
}

export const configureSockets = (
  server: http.Server,
  redis: RedisApi,
  dbWatcher: DbWatcher
) => {
  const baseSocket = io(server)
  baseSocket.origins([frontendUrl])

  const authnSocket = baseSocket.of(Endpoints.authn)
  const receiveCredSocket = baseSocket.of(Endpoints.receive)

  authnSocket.on(
    SocketEvents.connection,
    authSocketConnectionHandler(dbWatcher, redis)
  )
  receiveCredSocket.on(
    SocketEvents.connection,
    credOfferSocketConnectionHandler(dbWatcher, redis)
  )
}

const credOfferSocketConnectionHandler = (
  dbWatcher: DbWatcher,
  redis: RedisApi
) => async (socket: Socket) => {
  const { credentialType, data } = socket.handshake.query
  const { identifier, qrCode } = await getQrEncodedToken(
    `${Endpoints.receive}${credentialType}`
  )
  await setDataFromUiForms(redis, identifier, data)

  socket.emit(SocketEvents.qrCode, { qrCode, identifier })
  watchDbForUpdate(identifier, dbWatcher, redis, socket)
}

const authSocketConnectionHandler = (
  dbWatcher: DbWatcher,
  redis: RedisApi
) => async (socket: Socket) => {
  const { identifier, qrCode } = await getQrEncodedToken(Endpoints.authn)
  socket.emit(SocketEvents.qrCode, { qrCode, identifier })
  watchDbForUpdate(identifier, dbWatcher, redis, socket)
}

const getQrEncodedToken = async (endpoint: string) => {
  const { identifier, token } = (await axios.get(
    `${serviceUrl}${endpoint}`
  )).data
  return { identifier, qrCode: await new SSO().JWTtoQR(token) }
}

const watchDbForUpdate = (
  identifier: string,
  dbWatcher: DbWatcher,
  redisApi: RedisApi,
  socket: Socket
) => {
  dbWatcher.addSubscription(identifier)
  dbWatcher.on(identifier, async () => {
    const userData = await redisApi.getAsync(identifier)
    await redisApi.delAsync(identifier)
    socket.emit(identifier, userData)
  })
}
