`use strict`;

require(`dotenv`).config();
import Workspace from "../models/workspace.model"
import TransferService from '../common/services/transfer'
import TranslationsService from '../common/services/translationsService'
import SlackClientService from '../common/services/slackClient'
const { SLACK_WORKSPACE_NAME } = process.env; // eslint-disable-line no-unused-vars
const { WebClient } = require('@slack/client');
import moment from 'moment'

export default class ExchangedKudos {
    private slackClientService = new SlackClientService()
    private transferService = new TransferService()
    protected translationsService = new TranslationsService()

    public postExchangedKudosOfTheDay = async () => {
        const { teamId, botAccessToken } = await Workspace.findOne({ teamName: SLACK_WORKSPACE_NAME })
        const botResponseChannelId = await this.slackClientService.getResponseBotChannelId(teamId);

        const { docs: transfers } = await this.transferService.getAllPaginated(
            teamId, 99999, 1,
            moment().subtract(1, 'd').toDate(),
            moment().toDate()
        );

        const client = new WebClient(botAccessToken);

        if (transfers.length > 0) {
            let transfersStr = ``;
            for (let i = 0; i < transfers.length; i++) {
                transfersStr += `${i + 1}. ${this.translationsService.getTranslation(
                    'xGaveYPoints',
                    transfers[i].senderId,
                    transfers[i].receiverId,
                    transfers[i].value,
                    transfers[i].comment
                )}\n`
            }

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
        } else if (moment().isoWeekday() >= 1 && moment().isoWeekday() <= 5) {
            client.chat.postMessage({
                blocks: [
                    {
                        type: `section`,
                        text: {
                            type: `mrkdwn`,
                            text: `@channel I am missing you all :face_with_monocle:`,
                        },
                    },
                    {
                        type: `section`,
                        text: {
                            type: `mrkdwn`,
                            text: `Take a moment to appreciate :clap: your team member’s Good Work!!! Enjoy your rest of the day :+1:`,
                        },
                    },
                ],
                channel: botResponseChannelId,
            });
        }
    }
}