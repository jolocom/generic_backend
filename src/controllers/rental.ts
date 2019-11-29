import { Request, Response } from 'express'
import { IdentityWallet } from 'jolocom-lib/js/identityWallet/identityWallet'

import { RedisApi, RequestWithInteractionTokens } from '../types'
import {
  password,
  serviceUrl
} from '../config'
import { bookToID } from '../helpers/books'
import {
  retrieveBook,
  getUserBooks,
  storeUserBooks
} from './library'

const generateRentalRequest = (
  identityWallet: IdentityWallet,
  redis: RedisApi
) => async (
  req: Request,
  res: Response
) => {
    console.log(req.params.did)
    const callbackURL = `${serviceUrl}/rent/`
    const book = await retrieveBook(req.params.did, redis)

    const description = `Rent ${book.title || 'this Book'}`

    try {
        const bookID = await bookToID(identityWallet.did)(book.ISBN, password)
        const rentRequest = await bookID.create.interactionTokens.request.auth(
            {
                callbackURL,
                description
            },
            password
        )
        const token = rentRequest.encode()
        res.send({ token, identifier: rentRequest.nonce })
    } catch (err) {
        console.log(err)
        res.send(500)
    }
}

const consumeRentalResponse = (redis: RedisApi) => async (
  req: RequestWithInteractionTokens,
  res: Response
) => {
  const issuer = req.userResponseToken.audience
  const user = req.userResponseToken.issuer

  const book = await retrieveBook(issuer, redis)

  if (book.did !== issuer) {
    res.status(403).send ('Invalid Token')
  }

  try {
    if (book.available) {
      // set book unavailable
      book.available = false
      // return book in 21 days
      const newDate = new Date();
      newDate.setTime(newDate.getTime() + 21 * 86400000)
      book.returnDate = newDate.toString()
      // add book to user table
      const userBooks = await getUserBooks(user, redis)
      await storeUserBooks(
        user,
        [...userBooks, { bookDid: issuer, progress: 0 }],
        redis
      )
      await redis.setAsync(issuer, JSON.stringify(book))
      res.status(200).send(issuer)
    } else {
      res.status(403).send('Book Unavailable')
    }
  } catch (err) {
      console.log(err)
      res.status(403).send('Book Unavailable')
  }
}

export const rental = {
  generateRentalRequest,
  consumeRentalResponse
}
