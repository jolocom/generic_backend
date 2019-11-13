import { promisify } from 'util'
const redis = require('redis')

const REDIS_HOST = process.env.REDIS_HOST || 'localhost'
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379')

// TODO Get from redis config
export const initializeRedisClient = () => {
  const client = redis.createClient({
    host: REDIS_HOST,
    port: REDIS_PORT
  })

  client.on('error', (err: Error) => {
    console.log(err)
  })

  // TODO explain / TEST
  return {
    getAsync: promisify(client.get).bind(client),
    setAsync: (key: string, value: string) =>
      promisify(client.set).bind(client)(key, value, 'EX', 60 * 30),
    delAsync: promisify(client.del).bind(client)
  }
}
