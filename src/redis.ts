import { promisify } from 'util'
const redis = require('redis')

// TODO Get from redis config
export const initializeRedisClient = () => {
  const client = redis.createClient({
    host: 'localhost',
    port: 6379
  })

  client.on('error', (err: Error) => {
    console.log(err)
  })

  // TODO explain / TEST
  return {
    getAsync: promisify(client.get).bind(client),
    setAsync: (key: string, value: string) =>
      promisify(client.set).bind(client)(key, value),
    delAsync: promisify(client.del).bind(client)
  }
}
