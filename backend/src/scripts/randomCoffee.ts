`use strict`;

require(`dotenv`).config();
import Workspace from "../models/workspace.model"
import SlackClientService from '../common/services/slackClient'
const { SLACK_WORKSPACE_NAME } = process.env; // eslint-disable-line no-unused-vars
const { WebClient } = require('@slack/client');
const axios = require(`axios`);
const _ = require(`lodash`);

export default class RandomCoffee {
    private slackClientService = new SlackClientService()

    public randomCoffee = async () => {
        const workspace = await Workspace.findOne({ teamName: SLACK_WORKSPACE_NAME });
        const botResponseChannelId = await this.slackClientService.getResponseBotChannelId(workspace.teamId);
        const apiConfig = {
            method: `get`,
            url: `https://slack.com/api/conversations.members?pretty=1&channel=${botResponseChannelId}`,
            headers: {
                'Authorization': `Bearer ${workspace.botAccessToken}`
            }
        };
        let { data: { ok, members: membersIdArray, error } } = await axios(apiConfig);
        if (ok && membersIdArray.length > 0) {
            this.postRandomCoffeeMessage(
                membersIdArray.filter(userId => userId != workspace.botUserId),
                workspace.botAccessToken,
                botResponseChannelId
            );
        }
    }

    private generateRandomIndex = (arrLength = 100) => {
        return Math.round(Math.random() * arrLength);
    };

    private getRandomCoffeeGroup = (arr, groupSize = 4) => {
        if (arr.length <= groupSize) return arr;

        const group = [];
        for (let i = 0; i < groupSize; i++) {
            const index = this.generateRandomIndex(arr.length);
            group.push(arr[index]);
            arr.splice(index, 1);
        }

        return group;
    };

    private postRandomCoffeeMessage = async (members, botAccessToken, botResponseChannelId) => {
        members = members.map(userId => `<@${userId}>`);
        const peopleArr = [];

        while (members.length !== 0) {
            if (members.length === 10 || members.length === 5) {
                const x = this.getRandomCoffeeGroup(members, 5);
                peopleArr.push(x);
                members = _.difference(members, peopleArr[peopleArr.length - 1]);
            } else {
                const x = this.getRandomCoffeeGroup([...members]);
                peopleArr.push(x);
                members = _.difference(members, peopleArr[peopleArr.length - 1]);
            }
        }

        let peopleStr = ``;
        for (let i = 0; i < peopleArr.length; i++) {
            peopleStr += `${i + 1}. `;
            for (let j = 0; j < peopleArr[i].length; j++) {
                peopleStr += `${peopleArr[i][j]} `;
            }
            peopleStr += `\n`;
        }

        const client = new WebClient(botAccessToken);

        client.chat.postMessage({
            blocks: [
                {
                    type: `section`,
                    text: {
                        type: `mrkdwn`,
                        text: `@channel :coffee: Random Coffee’s for this week`,
                    },
                },
                {
                    type: `section`,
                    text: {
                        type: `mrkdwn`,
                        text: peopleStr,
                    },
                },
            ],
            channel: botResponseChannelId,
        });
    };
}
