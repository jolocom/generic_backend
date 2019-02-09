import { JolocomLib } from "jolocom-lib";
import { password, seed, serviceUrl } from "../config";
import axios, {AxiosResponse} from 'axios'
import { claimsMetadata } from "cred-types-jolocom-core";
import { Endpoints } from "./sockets";
import { CredentialOffer } from "jolocom-lib/js/interactionTokens/credentialOffer";
import { JSONWebToken } from "jolocom-lib/js/interactionTokens/JSONWebToken";
import {Response} from 'express'

const getIdentityWallet = async () => {
  const registry = JolocomLib.registries.jolocom.create();
  const vaultedKeyProvider = new JolocomLib.KeyProvider(seed, password);

  return registry.authenticate(vaultedKeyProvider, {
    derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
    encryptionPass: password
  });
};

export const testCredentialReceive = async () => {
  const identityWallet = await getIdentityWallet();

  const { token } = (await axios.get(
    `${serviceUrl}${Endpoints.receive}id-card`
  )).data;
  const credentialOffer: JSONWebToken<
    CredentialOffer
  > = JolocomLib.parse.interactionToken.fromJWT(token);

  const offerResponse = await identityWallet.create.interactionTokens.response.offer(
    credentialOffer.interactionToken.toJSON(),
    password,
    JolocomLib.parse.interactionToken.fromJWT(token)
  );

  return axios
    .post(`${serviceUrl}${Endpoints.receive}id-card`, {
      token: offerResponse.encode()
    })
    .catch(err => console.log(err));
};

export const testCredentialOffer = async () => {
  const identityWallet = await getIdentityWallet();

  const { token } = (await axios.get(`${serviceUrl}${Endpoints.authn}`)).data;
  const credentialRequest = JolocomLib.parse.interactionToken.fromJWT(token);

  const cred = await identityWallet.create.signedCredential(
    {
      subject: credentialRequest.issuer,
      claim: {
        email: "test"
      },
      metadata: claimsMetadata.emailAddress
    },
    password
  );

  const credentialResponse = await identityWallet.create.interactionTokens.response.share(
    {
      suppliedCredentials: [cred.toJSON()],
      callbackURL: credentialRequest.interactionToken.callbackURL
    },
    password,
    credentialRequest
  );

  return axios
    .post(`${serviceUrl}/authenticate`, {
      token: credentialResponse.encode()
    })
    .catch(err => console.log(err));
};

testCredentialReceive().then((res: AxiosResponse) => console.log(res.status))
testCredentialOffer().then((res:AxiosResponse) => console.log(res.status)).catch(err => console.log(err));
