import { SSO } from 'jolocom-lib/js/sso/sso'
import * as io from 'socket.io'
import { serviceUrl } from './config'
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
  share = '/share',
  auth = '/auth',
  receive = '/receive'
}

export const configureSockets = (
  server: http.Server,
  redis: RedisApi,
  dbWatcher: DbWatcher
) => {
  const baseSocket = io(server)
  const shareSocket = baseSocket.of(Endpoints.share)
  const receiveCredSocket = baseSocket.of(Endpoints.receive)
  const authSocket = baseSocket.of(Endpoints.auth)

  shareSocket.on(
    SocketEvents.connection,
    shareSocketConnectionHandler(dbWatcher, redis)
  )
  receiveCredSocket.on(
    SocketEvents.connection,
    credOfferSocketConnectionHandler(dbWatcher, redis)
  )
  authSocket.on(
    SocketEvents.connection,
    authSocketConnectionHandler(dbWatcher, redis)
  )
}

const authSocketConnectionHandler = (
  dbWatcher: DbWatcher,
  redis: RedisApi
) => async (socket: Socket) => {
  const { identifier, qrCode } = await getQrEncodedToken(Endpoints.auth)
  socket.emit(SocketEvents.qrCode, { qrCode, identifier })
  watchDbForUpdate(identifier, dbWatcher, redis, socket)
}

const credOfferSocketConnectionHandler = (
  dbWatcher: DbWatcher,
  redis: RedisApi
) => async (socket: Socket) => {
  const { types, invalid, data } = socket.handshake.query
  let endpoint = `${Endpoints.receive}?types=${types}`

  if (invalid) endpoint = endpoint.concat(`&invalid=${invalid}`)

  const { identifier, qrCode } = await getQrEncodedToken(endpoint)
  await setDataFromUiForms(redis, identifier, data)

  socket.emit(SocketEvents.qrCode, { qrCode, identifier })
  watchDbForUpdate(identifier, dbWatcher, redis, socket)
}

const shareSocketConnectionHandler = (
  dbWatcher: DbWatcher,
  redis: RedisApi
) => async (socket: Socket) => {
  const { types } = socket.handshake.query
  const { identifier, qrCode } = await getQrEncodedToken(
    `${Endpoints.share}?types=${types}`
  )
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
