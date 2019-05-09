import { RedisApi } from 'src/types'
import { Express } from 'express'
import { library } from '../controllers/library';
import { bookList } from '../config';

export const configureCustomRoutes = (app: Express, redis: RedisApi) => {
  library.populateDB(redis)(bookList).then(_ => {
    app
      .route('/books/')
      .get(library.getBooks(redis))

    app
      .route('/book/:isbn')
      .get(library.getBookDetails(redis))

    app
      .route('/rent/:isbn')
      .get() // get cred/auth request
      .post() // post response, confirm rental
  });
}

