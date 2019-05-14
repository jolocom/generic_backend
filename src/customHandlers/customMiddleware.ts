import { RequestWithInteractionTokens, RedisApi } from 'src/types'
import { Response, NextFunction } from 'express'
import { library } from '../controllers/library'


export const addCustomAuthnMiddleware = (redis: RedisApi) => async (
    req: RequestWithInteractionTokens,
    res: Response,
    next: NextFunction
) => {

    try {
        const rented = await library.rentBook(redis)(req.serviceRequestToken.issuer, req.userResponseToken.issuer)
        if (rented === false) {
            res.status(400).send("Unable to rent book")
        }
    } catch (err) {
        res.status(500).send(err)
    }
    next()
}
