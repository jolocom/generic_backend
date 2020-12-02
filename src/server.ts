import * as http from 'http'
import { configureDefaultRoutes } from './routes'
import { getConfiguredApp } from './app'
import { password, seedPhrase, dbConf } from './config'
import { configureSockets } from './sockets'
import { configureCustomRoutes } from './customHandlers/customRoutes'
import { JolocomSDK } from '@jolocom/sdk'
import { JolocomTypeormStorage } from '@jolocom/sdk-storage-typeorm'
import { createConnection } from 'typeorm'

const app = getConfiguredApp()
const server = new http.Server(app)

const sdk = new JolocomSDK({
  storage: new JolocomTypeormStorage(createConnection({
    ...dbConf,
    entities: ['node_modules/@jolocom/sdk-storage-typeorm/js/src/entities/*.js'],
    synchronize: true,
  }))
})

sdk.createAgentFromMnemonic(seedPhrase, false, password).then(agent => {
  configureDefaultRoutes(app, agent)
  configureCustomRoutes(app, agent)
  configureSockets(server)
  server.listen(9000)
}).catch(err => {
  console.error(err)
  console.trace()
  process.exit(1)
})
