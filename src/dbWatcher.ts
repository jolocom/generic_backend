import { EventEmitter } from 'events'

export class DbWatcher extends EventEmitter {
  private watchedKeys: Set<string> = new Set()
  private readonly interval = 2000
  private readonly getAsync: (key: string) => string

  constructor(getAsyncImplementation: (key: string) => string) {
    super()
    this.getAsync = getAsyncImplementation
    setInterval(this.checkSubscriptions.bind(this), this.interval)
  }

  async checkSubscriptions() {
    this.watchedKeys.forEach(async (watchedKey) => {
      const data = JSON.parse(await this.getAsync(watchedKey))
      const isSuccess = data && data.status === 'success'

      if (isSuccess) this.emit(watchedKey)
      if (!data || isSuccess) this.watchedKeys.delete(watchedKey)
    })
  }

  addSubscription(userId: string) {
    this.watchedKeys.add(userId)
  }
}
