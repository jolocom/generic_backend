import { credentialOffers, password, serviceUrl } from "../../config";
import { Request, Response } from "express";
import { IdentityWallet } from "jolocom-lib/js/identityWallet/identityWallet";
import { RedisApi } from "../types";
import { JolocomLib } from "jolocom-lib";
import { keyIdToDid } from "jolocom-lib/js/utils/helper";
import {
  getDataFromUiForms,
  setStatusDone,
  setStatusPending
} from "../helpers";

const generateCredentialOffer = async (
  identityWallet: IdentityWallet,
  redis: RedisApi,
  req: Request,
  res: Response
) => {
  const { credentialType } = req.params;

  try {
    // TODO source from config
    const credOffer = await identityWallet.create.interactionTokens.request.offer(
      {
        callbackURL: `${serviceUrl}/receive/${credentialType}`,
        requestedInput: {},
        instant: true
      },
      password
    );

    const token = credOffer.encode();
    await setStatusPending(redis, credOffer.nonce, { request: token });
    return res.send({ token, identifier: credOffer.nonce });
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
};

const consumeCredentialOfferResponse = async (
  identityWallet: IdentityWallet,
  redis: RedisApi,
  req: Request,
  res: Response
) => {
  const { credentialType } = req.params;

  if (!credentialType || !credentialOffers[credentialType]) {
    return res.status(401).send("Requested credential type is not supported");
  }

  // @ts-ignore
  const credentialOfferResponse = req.interactionToken;
  const claim = await getDataFromUiForms(redis, credentialOfferResponse.nonce) || {};

  const credential = await identityWallet.create.signedCredential(
    {
      metadata: credentialOffers[credentialType],
      claim,
      subject: keyIdToDid(credentialOfferResponse.issuer)
    },
    password
  );

  const credentialReceive = await identityWallet.create.interactionTokens.response.issue(
    {
      signedCredentials: [credential.toJSON()]
    },
    password,
    credentialOfferResponse
  );

  await setStatusDone(redis, credentialOfferResponse.nonce);
  return res.json({ token: credentialReceive.encode() });
};

export const issuance = {
  generateCredentialOffer,
  consumeCredentialOfferResponse
};
