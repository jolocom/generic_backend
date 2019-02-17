import axios, { AxiosPromise } from "axios";
import { RequestWithInteractionTokens, RedisApi } from 'src/types';
import { Response, NextFunction } from 'express';
import { CredentialResponse } from 'jolocom-lib/js/interactionTokens/credentialResponse';
import { claimsMetadata } from 'cred-types-jolocom-demo'
import { areArraysEqual } from '../helpers';
import { AccessTokens, AKaartUserRecord, generateHeadersFromAccessTokens, debugConfig, gatewayUrl } from './utils';

const getUserDataALoyaltyService = (
    accessTokens: AccessTokens,
    gatewayUrl: string
) => (identifier: string): AxiosPromise<AKaartUserRecord> => {
    const endpoint = `${gatewayUrl}/account-info/card-numbers/${identifier}`
    const headers = generateHeadersFromAccessTokens(accessTokens)
    return axios.get<AKaartUserRecord>(endpoint, {headers})
}

const getUserInfo = getUserDataALoyaltyService(debugConfig, gatewayUrl);

const getUserCheques = (cardNumber: string) => getUserInfo(cardNumber)
    .then(res => res.data.cheques || []);

export const addCustomAuthnMiddleware = (redis: RedisApi) => async (
  req: RequestWithInteractionTokens,
  res: Response,
  next: NextFunction
) => {
  const { suppliedCredentials } = req.userResponseToken.interactionToken as CredentialResponse;

  const aKaartCredential = suppliedCredentials.find(credential =>
    areArraysEqual(credential.type, claimsMetadata.akaart.type)
  );

  if (!aKaartCredential) {
    res.status(401).send("No A-Kaart credential was found");
  }

  // const { identifier: aKaartIdentifier } = aKaartCredential.claim;
  const aKaartIdentifier = "900003070316";

  const aKaartRecord = {
    success: true,
    identifier: aKaartIdentifier,
    cheque: {}
  };

  try {
    const cheques = await getUserCheques(aKaartIdentifier);

    if (cheques.length) {
      req.middlewareData = {
        ...aKaartRecord,
        cheque: cheques[0]
      };

      await redis.setAsync(
          cheques[0].chequeId.toString(),
          aKaartIdentifier as string
      );
    }

    next();
  } catch (err) {
    req.middlewareData = {
      ...aKaartRecord,
      success: false,
      error: err.message
    };
    res.status(401).send("Could not validate A-Kaart account");
  }
};
