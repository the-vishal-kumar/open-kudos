require(`dotenv`).config();
import cron from 'node-cron'
import LoggerService from './logger'
import SettingsService from './settings'
import UserService from './user'
import RandomCoffeeService from '../../scripts/randomCoffee'
import ExchangedKudosService from '../../scripts/exchangedKudos'
import KudosTipService from '../../scripts/kudosTip'

export default class ConfigurationService {
  private userService = new UserService()
  private settingsService = new SettingsService()
  private randomCoffeeService = new RandomCoffeeService()
  private logger = new LoggerService()

  private exchangedKudosService = new ExchangedKudosService()
  private kudosTipService = new KudosTipService()

  public setRenewKudosTask() {
    // At 18:30 on Sunday UTC
    // At 00:00 on Monday IST
    cron.schedule('30 18 * * 0', async () => {
      try {
        this.logger.logInfo('Renew Kudos Cron task start')
        const kudosAmountForWorkspace = await this.settingsService
          .getAllTeamsKudosWeeklyAmount()

        await this.userService
          .renewAllUsersKudos(kudosAmountForWorkspace)

        this.logger.logInfo('Renew Kudos Cron task end successful')
      } catch (error) {
        this.logger.logError(error)
      }
    })
  }

  public setDiscardOldKudosTask() {
    // At 18:30 on Monday UTC
    // At 00:00 on Tuesday IST
    cron.schedule('30 18 * * 1', async () => {
      try {
        this.logger.logInfo('Discard Old Kudos Cron task start')
        await this.userService.discardAllUsersOldKudos()
        this.logger.logInfo('Discard Old Kudos Cron task end successful')
      } catch (error) {
        this.logger.logError(error)
      }
    })
  }

  public setExchangedKudosOfTheDayTask() {
    // At 12:30 on Monday-Sunday UTC
    // At 18:00 on Monday-Sunday IST
    cron.schedule('30 12 * * *', async () => {
      try {
        this.logger.logInfo('setExchangesKudosOfTheDayTask::::Cron task start::::')
        this.exchangedKudosService.postExchangedKudosOfTheDay()
        this.logger.logInfo('setExchangesKudosOfTheDayTask::::Cron task end successful::::')
      } catch (error) {
        this.logger.logError(error)
      }
    })
  }

  public setRandomCoffeeNotifierTask() {
    // At 06:30 on Monday UTC
    // At 12:00 on Monday IST
    cron.schedule('30 6 * * 1', async () => {
      try {
        this.logger.logInfo('Random Coffee Notifier Cron task start')
        await this.randomCoffeeService.randomCoffee()
        this.logger.logInfo('Random Coffee Notifier Cron task end successful')
      } catch (error) {
        this.logger.logError(error)
      }
    })
  }

  public postKudosTip() {
    this.logger.logInfo('Post Kudos Tip Start')
    this.kudosTipService.postKudosTip();
    this.logger.logInfo('Kudos Tip posted successfully')
  }
}
