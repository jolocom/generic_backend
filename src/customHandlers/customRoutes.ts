import { RedisApi } from 'src/types'
import { Express } from 'express'
import { library } from '../controllers/library'
import {
    bookList,
    password
} from '../config'
import { setupLibrary } from '../helpers/books';
import { IdentityWallet } from 'jolocom-lib/js/identityWallet/identityWallet';

export const configureCustomRoutes = async (app: Express, redis: RedisApi, identityWallet: IdentityWallet) =>
    library.populateDB(redis)(setupLibrary(identityWallet, password, bookList))
        .then(_ => {
            app
                .route('/books/')
                .get(library.getBooks(redis))

            app
                .route('/book/:did')
                .get(library.getBookDetails(redis))
        })
