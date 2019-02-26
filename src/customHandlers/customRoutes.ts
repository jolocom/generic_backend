import axios from 'axios'
import { RedisApi } from 'src/types'
import { Response, Request, Express } from 'express'
import {
  debugConfig,
  gatewayUrl,
  AccessTokens,
  generateHeadersFromAccessTokens
} from './utils'

const spendUserCheque = (accessTokens: AccessTokens, gatewayUrl: string) => (
  cardNumber: number,
  chequeId: number
) => {
  axios.post(
    `${gatewayUrl}/redeem`,
    {
      cardNumber,
      chequeIds: [chequeId]
    },
    {
      headers: generateHeadersFromAccessTokens(accessTokens)
    }
  )
}

const configuredSpendUserCheque = spendUserCheque(debugConfig, gatewayUrl)

export const configureCustomRoutes = (app: Express, redis: RedisApi) => {
  app.post('/spend/:chequeId', async (req: Request, res: Response) => {
    const { chequeId } = await req.params
    const aKaartIdentifier = await redis.getAsync(chequeId)

    if (!aKaartIdentifier) {
      return res.status(401).send('Attempt to spent unknown cheque')
    }

    try {
      await configuredSpendUserCheque(+aKaartIdentifier, +chequeId)
      await redis.delAsync(chequeId)
      return res.status(200).send(chequeId)
    } catch (err) {
      return res.status(500).send(err.message)
    }
  })
}
