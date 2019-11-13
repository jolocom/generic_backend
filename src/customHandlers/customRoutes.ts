import { RedisApi } from 'src/types'
import { Express } from 'express'
import { graphs } from '../config'

export const configureCustomRoutes = (app: Express, redis: RedisApi) => {
    app
        .route('/graph/')
        .get((req, res) => res.send({ graph: graphs[0] }))
}
