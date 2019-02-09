import { JolocomLib } from "jolocom-lib";
import { RedisApi, RequestWithInteractionTokens } from "./types";
import { NextFunction, Response } from "express";

export const validateSentInteractionToken = async (
  req: RequestWithInteractionTokens,
  res: Response,
  next: NextFunction
) => {
  try {
    const interactionToken = await JolocomLib.parse.interactionToken.fromJWT(
      req.body.token
    );

    if (!JolocomLib.util.validateDigestable(interactionToken)) {
      return res.status(401).send("Invalid signature on interaction token");
    }

    req.interactionToken = interactionToken;
    return next();
  } catch (err) {
    return res
      .status(401)
      .send(`Could not parse interaction token - ${err.message}`);
  }
};

export const matchAgainstRequest = (redis: RedisApi) => async (
  req: RequestWithInteractionTokens,
  res: Response,
  next: NextFunction
) => {
  const sentRequestJWT = await redis.getAsync(req.interactionToken.nonce);

  if (!sentRequestJWT) {
    return res.status(401).send("No request token found");
  }

  const { request: requestToken } = JSON.parse(sentRequestJWT);

  try {
    req.requestToken = JolocomLib.parse.interactionToken.fromJWT(requestToken);
  } catch (err) {
    return res
      .status(401)
      .send(`Failed to decode request token - ${err.message}`);
  }

  return next();
};
