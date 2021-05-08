`use strict`;

require(`dotenv`).config();
import Workspace from "../models/workspace.model"
import SlackClientService from '../common/services/slackClient'
const { SLACK_WORKSPACE_NAME } = process.env; // eslint-disable-line no-unused-vars
const { WebClient } = require('@slack/client');

export default class KudosTip {
    private slackClientService = new SlackClientService()

    public postKudosTip = async () => {
        const { teamId, botAccessToken } = await Workspace.findOne({ teamName: SLACK_WORKSPACE_NAME })
        const botResponseChannelId = await this.slackClientService.getResponseBotChannelId(teamId);

        const client = new WebClient(botAccessToken);

        client.chat.postMessage({
            blocks: [
                {
                    type: `section`,
                    text: {
                        type: `mrkdwn`,
                        text: `@channel *Tip*: You can give \`Kudos\` on weekends too!`,
                    },
                },
                {
                    "type": "divider"
                },
                {
                    type: `section`,
                    text: {
                        type: `mrkdwn`,
                        text: `use */kudos give @receiver for [reason]* to give kudos`,
                    },
                },
                {
                    "type": "divider"
                },
                {
                    type: `section`,
                    text: {
                        type: `mrkdwn`,
                        text: `use */kudos help* to see the list of commands`,
                    },
                },
            ],
            channel: botResponseChannelId,
        });
    }
}