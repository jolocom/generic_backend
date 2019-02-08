import { SSO } from "jolocom-lib/js/sso/sso";
import * as io from "socket.io";
import { serviceUrl } from "../config";
import * as http from "http";
import { DbWatcher } from "./dbWatcher";
import { IdentityWallet } from "jolocom-lib/js/identityWallet/identityWallet";
import { RedisApi } from "./types";
import * as fetch from "isomorphic-unfetch";
import { Socket } from "socket.io";

export const configureSockets = (
  server: http.Server,
  identityWallet: IdentityWallet,
  redisApi: RedisApi,
  dbWatcher: DbWatcher
) => {
  const baseSocket = io(server);
  baseSocket.origins(["http://localhost:3000"]);

  const authnSocket = baseSocket.of("/authn");
  const receiveCredSocket = baseSocket.of("/receive");

  authnSocket.on("connection", async socket => {
    const authUrl = `${serviceUrl}/authenticate`;
    // @ts-ignore
    const { token, identifier } = await fetch(authUrl).then(r => r.json());

    await redisApi.setAsync(
      identifier,
      JSON.stringify({ identifier, request: token, status: "pending" })
    );

    const qrCode = await new SSO().JWTtoQR(token);

    socket.emit("qrCode", { qrCode, identifier });
    watchDbForUpdate(identifier, dbWatcher, redisApi, socket);
  });

  receiveCredSocket.on("connection", async socket => {
    const {credentialType, ...data} = socket.handshake.query;
    const recUrl = `${serviceUrl}/receive/`;

    // @ts-ignore
    const { token, identifier } = await fetch(recUrl).then(r => r.json());

    await redisApi.setAsync(
      identifier,
      JSON.stringify({ credentialType, ...data, token })
    );

    const qrCode = await new SSO().JWTtoQR(token);
    socket.emit("qrCode", { qrCode, identifier });
    watchDbForUpdate(identifier, dbWatcher, redisApi, socket);
  });
};

const watchDbForUpdate = (
  identifier: string,
  dbWatcher: DbWatcher,
  redisApi: RedisApi,
  socket: Socket
) => {
  dbWatcher.addSubscription(identifier);
  dbWatcher.on(identifier, async () => {
    const userData = await redisApi.getAsync(identifier);
    await redisApi.delAsync(identifier);
    socket.emit(identifier, userData);
  });
};
