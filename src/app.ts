import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'

/**
 * @description Returns an Express app instance with configured CORS / body parser
 * @return {Express}
 */

export const getConfiguredApp = () => {
  const expressApp = express()
  expressApp.use(express.static('dist'))
  expressApp.use(bodyParser.urlencoded({ extended: false }))
  expressApp.use(bodyParser.json())
  expressApp.use(cors())

  return expressApp
}
