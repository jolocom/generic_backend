import { RedisApi } from 'src/types'
import { Express } from 'express'
import { library } from '../controllers/library';

export const configureCustomRoutes = (app: Express, redis: RedisApi) => {
  app
    .route('/books/')
    .get(library.getBooks(redis))

  app
    .route('/book/:isbn')
    .get(library.getBookDetails(redis))
}
