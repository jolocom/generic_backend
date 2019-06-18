import { Response, Request } from 'express'
import { RedisApi, RequestWithInteractionTokens } from '../types'
import { bookList } from '../config'
import { NextFunction } from 'express-serve-static-core'
import { LibraryBook } from 'books';

const retrieveBook = async (did: string, redis: RedisApi) =>
  JSON.parse(await redis.getAsync(did))
const retrieveDID = async (isbn: number, redis: RedisApi) =>
  await redis.getAsync(isbn.toString())

const getBooks = (redis: RedisApi) => async (req: Request, res: Response) =>
  Promise.all(
    bookList.map(
      async isbn => await retrieveBook(await retrieveDID(isbn, redis), redis)
    )
  )
    .then(books => res.send(books))
    .catch(err => res.status(500).send(err))

const getBookDetails = (redis: RedisApi) => async (
  req: Request,
  res: Response
) =>
  retrieveBook(req.params.did, redis)
    .then(book => res.send(book))
    .catch(err => res.status(404).send(err))

const rentBook = (redis: RedisApi) => async (
  req: RequestWithInteractionTokens,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookDid = req.body.did
    const userDid = req.userResponseToken.issuer
    // is book rented?
    const book = await retrieveBook(bookDid, redis)
    if (book.available) {
      // set book unavailable
      book.available = false

      // add book to user table
      const userBooks = JSON.parse(await redis.getAsync(userDid)) as string[]
      if (userBooks) {
        userBooks.push(bookDid)
        await redis.setAsync(userDid, JSON.stringify(userBooks))
        await redis.setAsync(bookDid, JSON.stringify(book))
      } else {
        const initUserBooks: string[] = [bookDid]
        await redis.setAsync(userDid, JSON.stringify(initUserBooks))
        await redis.setAsync(bookDid, JSON.stringify(book))
      }
    } else {
      res.status(403).send('Book Unavailable')
    }
  } catch (err) {
    console.log(err)
    res.status(403).send('Book Unavailable')
  }
  next()
}

const returnBook = (redis: RedisApi) => async (
  req: RequestWithInteractionTokens,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookDid = req.body.did
    const userDid = req.userResponseToken.issuer

    // is book rented?
    const book = await retrieveBook(bookDid, redis)
    if (!book.available) {
      // set book available
      book.available = true

      // remove book from user table
      const userBooks = JSON.parse(await redis.getAsync(userDid)) as string[]
      const newUserBooks = userBooks.filter(did => did != bookDid)
      await redis.setAsync(userDid, JSON.stringify(newUserBooks))
      await redis.setAsync(bookDid, JSON.stringify(book))
    } else {
      res.status(403).send('Book not rented to you')
    }
  } catch (err) {
    res.status(403).send('Book not rented to you')
  }
  next()
}

const populateDB = (redis: RedisApi) => async (
  bookList: LibraryBook[]
) => {
  bookList.forEach(async book => {
        await redis.setAsync(book.did, JSON.stringify(book))
        await redis.setAsync(book.ISBN.toString(), book.did)
      }
  )
}

export const library = {
  getBooks,
  getBookDetails,
  rentBook,
  returnBook,
  populateDB
}
