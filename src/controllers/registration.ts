import { Request, Response } from "express";
import { IdentityWallet } from "jolocom-lib/js/identityWallet/identityWallet";

import {RedisApi, RequestWithInteractionTokens} from '../types'
import { credentialRequirements, password, serviceUrl } from "../../config";
import {
  extractDataFromClaims,
  generateRequirementsFromConfig,
  setStatusDone,
  setStatusPending
} from "../helpers/";
import {CredentialResponse} from 'jolocom-lib/js/interactionTokens/credentialResponse'
import {CredentialRequest} from 'jolocom-lib/js/interactionTokens/credentialRequest'

const generateCredentialShareRequest = async (
  identityWallet: IdentityWallet,
  redis: RedisApi,
  res: Response
) => {
  const callbackURL = `${serviceUrl}/authenticate`;

  const credentialRequest = await identityWallet.create.interactionTokens.request.share(
    {
      callbackURL,
      credentialRequirements: generateRequirementsFromConfig(
        credentialRequirements
      )
    },
    password
  );

  const token = credentialRequest.encode();
  await setStatusPending(redis, credentialRequest.nonce, { request: token });
  res.send({ token, identifier: credentialRequest.nonce });
};

const consumeCredentialShareResponse = async (
  redis: RedisApi,
  req: RequestWithInteractionTokens,
  res: Response
) => {
  const response = req.interactionToken.interactionToken as CredentialResponse
  const request = req.requestToken.interactionToken as CredentialRequest
  const {issuer, nonce} = req.requestToken

  try {
    if (!response.satisfiesRequest(request)) {
      res
        .status(401)
        .send(
          "The supplied credentials do not match the types of the requested credentials"
        );
    }

    const data = {
      ...extractDataFromClaims(response),
      did: issuer
    };

    await setStatusDone(redis, nonce, data);
    return res.status(200).send();
  } catch (err) {
    console.log(err);
    return res.status(401).send(err.message);
  }
};

export const registration = {
  generateCredentialShareRequest,
  consumeCredentialShareResponse
};
