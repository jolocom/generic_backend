import { RedisApi } from 'src/types'
import { Express } from 'express'
import { library } from '../controllers/library'
import {
    bookList,
    password
} from '../config'
import { setupLibrary } from '../helpers/books'
import { IdentityWallet } from 'jolocom-lib/js/identityWallet/identityWallet'
import {
    matchAgainstRequest,
    validateCredentialsAgainstRequest,
    validateSentInteractionToken
} from './../middleware'
import { registration } from './../controllers/registration'

export const configureCustomRoutes = async (app: Express, redis: RedisApi, identityWallet: IdentityWallet) => {
    const books = setupLibrary(identityWallet, password, bookList)
    const bookIdws = books.map(book => book.idw)
    await library.populateDB(redis)(books)

    app
        .route('/login/')
        .get()

    app
        .route('/books/')
        .get(library.getBooks(redis))

    app
        .route('/book/:did')
        .get(library.getBookDetails(redis))

    app
        .route('/rent/:did')
        .post(validateSentInteractionToken,
              matchAgainstRequest(redis),
              validateCredentialsAgainstRequest,
              library.rentBook(redis))

    app
        .route('/return/:did')
        .post(validateSentInteractionToken,
              matchAgainstRequest(redis),
              validateCredentialsAgainstRequest,
              library.returnBook(redis))

}
