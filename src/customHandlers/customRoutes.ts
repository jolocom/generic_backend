import { RedisApi } from 'src/types'
import { Express } from 'express'
import { library } from '../controllers/library'
import { password } from '../config'
import { setupLibrary } from '../helpers/books'
import { IdentityWallet } from 'jolocom-lib/js/identityWallet/identityWallet'
import {
  matchAgainstRequest,
  validateCredentialsAgainstRequest,
  validateSentInteractionToken
} from './../middleware'
import { registration } from './../controllers/registration'
import { rental } from './../controllers/rental'
import { uniqueBooks } from '../books'

export const configureCustomRoutes = async (
  app: Express,
  redis: RedisApi,
  identityWallet: IdentityWallet
) => {
  const books = setupLibrary(identityWallet, password, uniqueBooks)
  await library.populateDB(redis)(books)

  app
    .route('/login/')
    .get(registration.generateCredentialShareRequest(identityWallet, redis))

  app.route('/books/').get(library.getBooks(redis))

  app.route('/book/:did').get(library.getBookDetails(redis))

  app.route('/rent/').post(
    validateSentInteractionToken,
    // matchAgainstRequest(redis),
    // validateCredentialsAgainstRequest,
    library.rentBook(redis)
  )

  app
    .route('/rentQR/:did')
    .get(rental.generateRentalRequest(identityWallet, redis))

  app
    .route('/rentBook/')
    .post(validateSentInteractionToken, rental.consumeRentalResponse(redis))

  app
    .route('/return/')
    .post(
      validateSentInteractionToken,
      matchAgainstRequest(redis),
      validateCredentialsAgainstRequest,
      library.returnBook(redis)
    )

  app
    .route('/progress/')
    .get(
      validateSentInteractionToken,
      matchAgainstRequest(redis),
      validateCredentialsAgainstRequest,
      library.getProgress(redis)
    )
    .post(
      validateSentInteractionToken,
      matchAgainstRequest(redis),
      validateCredentialsAgainstRequest,
      library.setProgress(redis)
    )

  app
    .route('/allprogress/')
    .get(
      validateSentInteractionToken,
      matchAgainstRequest(redis),
      validateCredentialsAgainstRequest,
      library.getAllProgress(redis)
    )
}
