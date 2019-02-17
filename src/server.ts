import { JolocomLib } from "jolocom-lib";
import * as http from "http";
import { configureDefaultRoutes } from "./routes";
import { getConfiguredApp } from "./app";
import { initializeRedisClient } from "./redis";
import { password, seed } from "../config";
import { configureSockets } from "./sockets";
import { DbWatcher } from "./dbWatcher";
import { configureCustomRoutes } from './customHandlers/customRoutes';

const app = getConfiguredApp();
const server = new http.Server(app);
const redis = initializeRedisClient();

const registry = JolocomLib.registries.jolocom.create();
const vaultedKeyProvider = new JolocomLib.KeyProvider(seed, password);
const dbWatcher = new DbWatcher(redis.getAsync);

registry
  .authenticate(vaultedKeyProvider, {
    derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
    encryptionPass: password
  })
  .then(identityWallet => {
    configureDefaultRoutes(app, redis, identityWallet);
    configureCustomRoutes(app, redis);
    configureSockets(server, identityWallet, redis, dbWatcher);
    server.listen(9000);
  });

