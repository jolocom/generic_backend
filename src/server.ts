import { JolocomLib } from 'jolocom-lib'
import * as http from 'http'
import { getConfiguredApp } from './app'
import { initializeRedisClient } from './redis'
import { password, seed, port } from './config'
import { configureCustomRoutes } from './customHandlers/customRoutes'

const app = getConfiguredApp()
const server = new http.Server(app)
const redis = initializeRedisClient()

const registry = JolocomLib.registries.jolocom.create()
const vaultedKeyProvider = new JolocomLib.KeyProvider(seed, password)

registry
    .authenticate(vaultedKeyProvider, {
        derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
        encryptionPass: password
    })
    .then(identityWallet => {
        configureCustomRoutes(app, redis, identityWallet)
        server.listen(port || 9000)
    })
