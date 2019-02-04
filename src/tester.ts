import { JolocomLib } from "jolocom-lib";
import { password, seed, serviceUrl } from "../config";
import axios from "axios";
import {claimsMetadata} from 'cred-types-jolocom-core'

export const generateValidCredentialResponse = async () => {
  const registry = JolocomLib.registries.jolocom.create();
  const vaultedKeyProvider = new JolocomLib.KeyProvider(seed, password);

  const { token } = (await axios.get(`${serviceUrl}/authenticate`)).data;

  const iw = await registry.authenticate(vaultedKeyProvider, {
    derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
    encryptionPass: password
  });

  const credentialRequest = JolocomLib.parse.interactionToken.fromJWT(token);
  const cred = await iw.create.signedCredential({
    subject: credentialRequest.issuer,
    claim: {
      email: 'temst'
    },
    metadata: claimsMetadata.emailAddress
  }, password)

  const credentialResponse = await iw.create.interactionTokens.response.share(
    {
      suppliedCredentials: [cred.toJSON()],
      callbackURL: credentialRequest.interactionToken.callbackURL
    },
    password,
    credentialRequest
  );

  return axios.post(`${serviceUrl}/authenticate`, {
    token: credentialResponse.encode()
  });
};

generateValidCredentialResponse()
  .then(res => console.log(res))
  .catch(err => console.log(err));
