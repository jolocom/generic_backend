import { Response } from 'express'
import { RedisApi, RequestWithInteractionTokens } from '../types'
import * as ISBN from 'node-isbn';
import {
  bookList
} from '../config'

const retrieveBook = async (isbn: number, redis: RedisApi) => JSON.parse(await redis.getAsync(isbn.toString()));

const getBooks = (
  redis: RedisApi
) => async (req: RequestWithInteractionTokens, res: Response) => {
  Promise.all(bookList.map(async (isbn) => await retrieveBook(isbn, redis)))
    .then(books => res.send(books))
    .catch(err => res.status(500).send(err))
}

const getBookDetails = (
  redis: RedisApi
) => async (
  req: RequestWithInteractionTokens,
  res: Response
) => {
  Promise.all(bookList.filter(isbn => isbn == req.params.isbn)
              .map(async (isbn) => await retrieveBook(isbn, redis)))
    .then(books => res.send(books[0]))
    .catch(err => res.status(404).send(err))
}

const populateDB = (
  redis: RedisApi
) => async (
  bookList: number[]
) => {
  Promise.all(bookList.map(isbn => ISBN.resolve(isbn)
                           .then(async (book) => {
                             const dbBook = await redis.getAsync(isbn.toString());
                             if (!dbBook || !dbBook.length) {
                               book.available = true;
                               await redis.setAsync(isbn.toString(), JSON.stringify(book))
                             }
                           })
                           .catch(console.log)))
}

export const library = {
  getBooks,
  getBookDetails,
  populateDB
};
