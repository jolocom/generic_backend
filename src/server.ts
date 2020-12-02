import * as http from 'http'
import { configureDefaultRoutes } from './routes'
import { getConfiguredApp } from './app'
import { password, seedPhrase, dbConf } from './config'
import { configureSockets } from './sockets'
import { initializeRedisClient } from './redis'
import { DbWatcher } from './dbWatcher'
import { configureCustomRoutes } from './customHandlers/customRoutes'
import { JolocomSDK } from '@jolocom/sdk'
import { JolocomTypeormStorage } from '@jolocom/sdk-storage-typeorm'
import { createConnection, ConnectionOptions } from 'typeorm'

const app = getConfiguredApp()
const server = new http.Server(app)
const redis = initializeRedisClient()
const dbWatcher = new DbWatcher(redis.getAsync)

const sdk = new JolocomSDK({
  // @ts-ignore
  storage: new JolocomTypeormStorage(createConnection({
    ...dbConf,
    entities: ['node_modules/@jolocom/sdk-storage-typeorm/js/src/entities/*.js'],
    synchronize: true,
  }))
})

sdk.createAgentFromMnemonic(seedPhrase, false, password).then(agent => {
  configureDefaultRoutes(app, redis, agent)
  configureCustomRoutes(app, redis)
  configureSockets(server, redis, dbWatcher)
  server.listen(9000)
  // @ts-ignore
}).catch(err => {
  console.error(err)
  console.trace()
  process.exit(1)
})
