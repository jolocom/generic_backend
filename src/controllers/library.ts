import { Response, Request } from 'express'
import { RedisApi, RequestWithInteractionTokens } from '../types'
import { bookList } from '../config'
import { NextFunction } from 'express-serve-static-core'
import { LibraryBook } from '../books'

interface UserBook {
  bookDid: string
  progress: number
}

const retrieveBook = async (did: string, redis: RedisApi) =>
  redis.getAsync(did).then(maybeBook => {
    return JSON.parse(maybeBook) as LibraryBook
  })

const retrieveDID = async (isbn: number, redis: RedisApi) =>
  redis.getAsync(isbn.toString()).then(did => {
    return did as string
  })

const getUserBooks = async (
  did: string,
  redis: RedisApi
): Promise<UserBook[]> =>
  redis
    .getAsync(did)
    .then(bs => {
      const books = JSON.parse(bs)
      if (books) {
        return books as UserBook[]
      } else {
        return []
      }
    })
    .catch(_ => {
      return []
    })

const storeUserBooks = async (did: string, books: UserBook[], redis: RedisApi) =>
  redis.setAsync(did, JSON.stringify(books))

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
      const userBooks = await getUserBooks(userDid, redis)
      await storeUserBooks(userDid, [...userBooks, {bookDid, progress: 0}], redis)
      await redis.setAsync(bookDid, JSON.stringify(book))
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
      book.reads = book.reads + 1

      // remove book from user table
      const userBooks = await getUserBooks(userDid, redis)
      const newUserBooks = userBooks.filter(book => book.bookDid != bookDid)
      await storeUserBooks(userDid, newUserBooks, redis)
      await redis.setAsync(bookDid, JSON.stringify(book))
    } else {
      res.status(403).send('Book not rented to you')
    }
  } catch (err) {
    res.status(403).send('Book not rented to you')
  }
  next()
}

const populateDB = (redis: RedisApi) => async (bookList: LibraryBook[]) => {
  bookList.forEach(async book => {
    await redis.setAsync(book.did, JSON.stringify(book))
    await redis.setAsync(book.ISBN.toString(), book.did)
  })
}

export const library = {
  getBooks,
  getBookDetails,
  rentBook,
  returnBook,
  populateDB
}
