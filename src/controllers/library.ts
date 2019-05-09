import { Response } from 'express'
import { RedisApi, RequestWithInteractionTokens } from '../types'
import {
  bookList
} from '../config'

const retrieveBook = async (isbn: number, redis: RedisApi) => JSON.parse(await redis.getAsync(isbn.toString()));

const getBooks = (
  redis: RedisApi
) => async (req: RequestWithInteractionTokens, res: Response) => {
  Promise.all(bookList.map(async (isbn) => await retrieveBook(isbn, redis)))
    .then(res.send)
    .catch(err => res.status(400).send(err))
}

const getBookDetails = (
  redis: RedisApi
) => async (
  req: RequestWithInteractionTokens,
  res: Response
) => {
  Promise.all(bookList.filter(isbn => isbn == req.body)
              .map(async (isbn) => await retrieveBook(isbn, redis)))
    .then(books => res.send(books[0]))
    .catch(err => res.status(400).send(err))
}

export const library = {
  getBooks,
  getBookDetails
}
