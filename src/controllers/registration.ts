import { Request, Response } from "express";
import { JolocomLib } from "jolocom-lib";
import { IdentityWallet } from "jolocom-lib/js/identityWallet/identityWallet";

import { RedisApi } from "../types";
import { credentialRequirements, password, serviceUrl } from "../../config";
import { extractDataFromClaims } from "../helpers/";
import { constraintFunctions } from "jolocom-lib/js/interactionTokens/credentialRequest";
import { IConstraint } from "jolocom-lib/js/interactionTokens/interactionTokens.types";

const generateCredentialShareRequest = async (
  identityWallet: IdentityWallet,
  redis: RedisApi,
  req: Request,
  res: Response
) => {
  const callbackURL = `${serviceUrl}/authenticate`;

  const parsedRequirements = credentialRequirements.map(({ type, issuer }) => ({
    type,
    constraints: (issuer
      ? [constraintFunctions.is("issuer", issuer)]
      : []) as IConstraint[]
  }));

  const credentialRequest = await identityWallet.create.interactionTokens.request.share(
    {
      callbackURL,
      credentialRequirements: parsedRequirements
    },
    password
  );

  const token = credentialRequest.encode();
  await redis.setAsync(credentialRequest.nonce, token);
  res.send({ token, identifier: credentialRequest.nonce });
};

const consumeCredentialShareResponse = async (
  identityWallet: IdentityWallet,
  redis: RedisApi,
  req: Request,
  res: Response
) => {
  const { token } = req.body;

  try {
    const credentialResponse = await JolocomLib.parse.interactionToken.fromJWT(
      token
    );

    const { request: requestJWT } = JSON.parse(
      await redis.getAsync(credentialResponse.nonce)
    );

    if (!requestJWT) {
      sendUnauthorizedMessage(res, "Corresponding request token not found");
    }

    const credentialRequest = await JolocomLib.parse.interactionToken.fromJWT(
      requestJWT
    );

    if (!(await JolocomLib.util.validateDigestable(credentialResponse))) {
      sendUnauthorizedMessage(res, "Invalid signature on interaction token");
    }

    if (
      !credentialResponse.interactionToken.satisfiesRequest(
        credentialRequest.interactionToken
      )
    ) {
      sendUnauthorizedMessage(
        res,
        "The supplied credentials do not match the types of the requested credentials"
      );
    }

    const data = {
      ...extractDataFromClaims(credentialResponse.interactionToken),
      did: credentialResponse.issuer,
      status: "success"
    };

    await redis.setAsync(
      credentialResponse.nonce,
      JSON.stringify({ status: "success", data })
    );
    return res.status(200).send();
  } catch (err) {
    console.log(err);
    return res.status(401).send(err.message);
  }
};

export const sendUnauthorizedMessage = (res: Response, message: string) =>
  res.status(401).send(message);

export const registration = {
  generateCredentialShareRequest,
  consumeCredentialShareResponse
};
