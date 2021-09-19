export default class Config {
  private static CLIENT_ID = 'CLIENT_ID'
  private static CLIENT_SECRET = 'CLIENT_SECRET'
  private static NODE_ENV = 'NODE_ENV'
  private static PORT = 'PORT'
  private static DB_CONNECTION_STRING = 'DB_CONNECTION_STRING'
  private static SLACK_AUTH_REDIRECT_URI = 'SLACK_AUTH_REDIRECT_URI'
  private static SLACK_INSTALL_REDIRECT_URI = 'SLACK_INSTALL_REDIRECT_URI'
  private static SIGNING_SECRET = 'SIGNING_SECRET'
  private static SIGNING_SECRET_VERSION = 'SIGNING_SECRET_VERSION'
  private static DROPBOX_TOKEN = 'DROPBOX_TOKEN'
  private static PUBLISH_EXCHANGED_KUDOS_OF_THE_DAY_UTC_TIME = 'PUBLISH_EXCHANGED_KUDOS_OF_THE_DAY_UTC_TIME'

  private static getEnvVariableByKey(key: string): string {
    const varValue = process.env[key]

    if (varValue === undefined) {
      throw new ReferenceError(
        // tslint:disable-next-line: max-line-length
        `Could not find environment variable with key ${key}! Check your .env file or provided env variables.`
      )
    }

    return varValue
  }

  public static get clientId(): string {
    return Config.getEnvVariableByKey(Config.CLIENT_ID)
  }

  public static get clientSecret(): string {
    return Config.getEnvVariableByKey(Config.CLIENT_SECRET)
  }

  public static get isProduction(): boolean {
    return Config.getEnvVariableByKey(Config.NODE_ENV) === 'production'
  }

  public static get port(): number {
    return Number(Config.getEnvVariableByKey(Config.PORT))
  }

  public static get dbConnectionString(): string {
    return Config.getEnvVariableByKey(Config.DB_CONNECTION_STRING)
  }

  public static get authRedirectUrl(): string {
    return Config.getEnvVariableByKey(Config.SLACK_AUTH_REDIRECT_URI)
  }

  public static get installRedirectUrl(): string {
    return Config.getEnvVariableByKey(Config.SLACK_INSTALL_REDIRECT_URI)
  }

  public static get signingSecret(): string {
    return Config.getEnvVariableByKey(Config.SIGNING_SECRET)
  }

  public static get signingSecretVersion(): string {
    return Config.getEnvVariableByKey(Config.SIGNING_SECRET_VERSION)
  }

  public static get dropboxToken(): string {
    return Config.getEnvVariableByKey(Config.DROPBOX_TOKEN)
  }

  public static get utcHourAndMinForPublishingExchangedKudosOfTheDay() {
    let hh = 12, mm = 30;
    const time = Config.getEnvVariableByKey(Config.PUBLISH_EXCHANGED_KUDOS_OF_THE_DAY_UTC_TIME)
    let splitTime = time && time.split(':')
    if (
      splitTime && splitTime.length == 2
      && parseInt(splitTime[0], 10) >= 0
      && parseInt(splitTime[0], 10) <= 23
      && parseInt(splitTime[1], 10) >= 0
      && parseInt(splitTime[1], 10) <= 59
    ) {
      hh = parseInt(splitTime[0], 10)
      mm = parseInt(splitTime[1], 10)
    }
    return { hh, mm }
  }
}
