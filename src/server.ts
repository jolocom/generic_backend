import * as http from 'http'
import {configureRoutes} from './routes'
import {JolocomLib} from 'jolocom-lib'
import {password, seed} from '../config'
import {getConfiguredApp} from './app'
import {initializeRedisClient} from './redis'
// import {configureRedisClient} from './redis'
// import {configureSockets} from './sockets'
// import {DbWatcher} from './dbWatcher'

const app = getConfiguredApp()
const server = new http.Server(app)
const redis = initializeRedisClient()

// const {getAsync, setAsync, delAsync} = configureRedisClient()
const registry = JolocomLib.registries.jolocom.create()
const vaultedKeyProvider = new JolocomLib.KeyProvider(seed, password)

registry.authenticate(vaultedKeyProvider, {
  derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
  encryptionPass: password
}).then(identityWallet => {
  configureRoutes(app, redis, identityWallet)
  server.listen(9000)
})

// configureSockets(
//   server,
//   identityWallet,
//   password,
//   new DbWatcher(getAsync),
//   {getAsync, setAsync, delAsync}

