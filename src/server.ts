import { JolocomLib } from "jolocom-lib";
import * as http from "http";
import { configureRoutes } from "./routes";
import { getConfiguredApp } from "./app";
import { initializeRedisClient } from "./redis";
import { password, seed } from "../config";
import { configureSockets } from "./sockets";
import { DbWatcher } from "./dbWatcher";

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
    configureRoutes(app, redis, identityWallet);
    configureSockets(server, identityWallet, redis, dbWatcher);
    server.listen(9000);
  });

