import { Response, Request } from 'express'
import { RedisApi, RequestWithInteractionTokens } from '../types'
import * as ISBN from 'node-isbn';
import {
    bookList
} from '../config'
import { IdentityWallet } from 'jolocom-lib/js/identityWallet/identityWallet';
import { NextFunction } from 'express-serve-static-core';
import { registration } from './registration'

const retrieveBook = async (did: string, redis: RedisApi) => JSON.parse(await redis.getAsync(did));
const retrieveDID = async (isbn: number, redis: RedisApi) => await redis.getAsync(isbn.toString());

const getBooks = (
    redis: RedisApi
) => async (
    req: Request,
    res: Response
) =>
        Promise.all(bookList.map(async (isbn) => await retrieveBook(await retrieveDID(isbn, redis), redis)))
            .then(books => res.send(books))
            .catch(err => res.status(500).send(err))

const getBookDetails = (
    redis: RedisApi
) => async (
    req: Request,
    res: Response
) =>
        retrieveBook(req.params.did, redis)
            .then(book => res.send(book))
            .catch(err => res.status(404).send(err))

const getRentReq = (
    redis: RedisApi,
    books: IdentityWallet[]
) => async (
    req: Request,
    res: Response
) => {
        try {
            const book = books.filter(b => b.did === req.params.did)[0]
            registration.generateCredentialShareRequest(book, redis)(req, res)
        } catch (err) {
            res.status(404).send("No such book")
        }
    }

const rentBook = (
    redis: RedisApi
) => async (
    req: RequestWithInteractionTokens,
    res: Response,
    next: NextFunction
) => {
        try {
            const bookDid = req.serviceRequestToken.issuer
            const userDid = req.userResponseToken.issuer

            // is book rented?
            const book = await retrieveBook(bookDid, redis)
            if (book.available) {
                // set book unavailable
                book.available = false

                // add book to user table
                const userBooks = JSON.parse(await redis.getAsync(userDid)) as string[];
                userBooks.push(bookDid)
                await redis.setAsync(userDid, JSON.stringify(userBooks))
                await redis.setAsync(bookDid, JSON.stringify(book))
            } else {
                res.status(403).send("Book Unavailable")
            }
        } catch (err) {
            res.status(403).send("Book Unavailable")
        }
        next()
    }

const getReturnReq = getRentReq

const returnBook = (
    redis: RedisApi
) => async (
    req: RequestWithInteractionTokens,
    res: Response,
    next: NextFunction
) => {
        try {
            const bookDid = req.serviceRequestToken.issuer
            const userDid = req.userResponseToken.issuer

            // is book rented?
            const book = await retrieveBook(bookDid, redis)
            if (!book.available) {


                // set book available
                book.available = true

                // remove book from user table
                const userBooks = JSON.parse(await redis.getAsync(userDid)) as string[];
                const newUserBooks = userBooks.filter(did => did != bookDid)
                await redis.setAsync(userDid, JSON.stringify(newUserBooks))
                await redis.setAsync(bookDid, JSON.stringify(book))
            } else {
                res.status(403).send("Book not rented to you")
            }
        } catch (err) {
            res.status(403).send("Book not rented to you")
        }
        next()
    }

const populateDB = (
    redis: RedisApi
) => async (
    bookList: Array<{
        isbn: number,
        idw: IdentityWallet
    }>
) => {
        bookList.map(book => ISBN.resolve(book.isbn)
            .then(async (bookDetails) => {
                bookDetails.did = book.idw.did
                bookDetails.available = true
                await redis.setAsync(book.idw.did, JSON.stringify(bookDetails))
                await redis.setAsync(book.isbn.toString(), book.idw.did)
            })
            .catch(console.error))
    }

export const library = {
    getBooks,
    getBookDetails,
    getRentReq,
    rentBook,
    getReturnReq,
    returnBook,
    populateDB
}
