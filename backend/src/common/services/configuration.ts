require(`dotenv`).config();
import cron from 'node-cron'
import LoggerService from './logger'
import SettingsService from './settings'
import Workspace from '../../models/workspace.model'
import UserService from './user'
import TransferService from './transfer'
import TranslationsService from "./translationsService"
import SlackClientService from './slackClient'
import RandomCoffeeService from '../../scripts/randomCoffee'
import moment from 'moment'
const { SLACK_WORKSPACE_NAME } = process.env; // eslint-disable-line no-unused-vars
const { WebClient } = require('@slack/client');

export default class ConfigurationService {
  private userService = new UserService()
  private transferService = new TransferService()
  private settingsService = new SettingsService()
  private randomCoffeeService = new RandomCoffeeService()
  private slackClientService = new SlackClientService()
  private logger = new LoggerService()
  protected translationsService = new TranslationsService()

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

  public setExchangesKudosOfTheDayTask() {
    // At 12:30 on Monday-Friday UTC
    // At 18:00 on Monday-Friday IST
    cron.schedule('30 12 * * 1-5', async () => {
      try {
        this.logger.logInfo('setExchangesKudosOfTheDayTask::::Cron task start::::')
        const { teamId, botAccessToken } = await Workspace.findOne({ teamName: SLACK_WORKSPACE_NAME })
        const botResponseChannelId = await this.slackClientService.getResponseBotChannelId(teamId);
        const { docs: transfers } = await this.transferService.getAllPaginated(
          teamId, 99999, 1,
          moment().subtract(1, 'd').toDate(),
          moment().toDate()
        );

        if (transfers.length > 0) {
          let transfersStr = ``;
          for (let i = 0; i < transfers.length; i++) {
            transfersStr += `${i + 1}. ${this.translationsService.getTranslation(
              'xGaveYZPoints',
              transfers[i].senderId,
              transfers[i].receiverId,
              transfers[i].value,
              transfers[i].comment
            )}\n`
          }

          const client = new WebClient(botAccessToken);

          client.chat.postMessage({
            blocks: [
              {
                type: `section`,
                text: {
                  type: `mrkdwn`,
                  text: `@channel Following :clap: were exchanged today`,
                },
              },
              {
                type: `section`,
                text: {
                  type: `mrkdwn`,
                  text: transfersStr,
                },
              },
            ],
            channel: botResponseChannelId,
          });
        }

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
}
