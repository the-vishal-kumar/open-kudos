import { RequestInterceptor } from '../interceptor'
import { getAuthToken } from '../utiles';

export default class AuthToken extends RequestInterceptor {
  static INTERCEPTOR_KEY = 'authToken'

  async resolve(config: any) {
    if (this.shouldSkipInterceptor(this, config)) {
      return config
    }

    config.headers = config.headers || {}
    config.headers.Authorization = getAuthToken()

    return config
  }
}
