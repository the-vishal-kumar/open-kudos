`use strict`;

require(`dotenv`).config();
import Workspace from "../models/workspace.model"
import SlackClientService from '../common/services/slackClient'
import UserService from '../common/services/user'
const { SLACK_WORKSPACE_NAME } = process.env; // eslint-disable-line no-unused-vars
const { WebClient } = require('@slack/client');
const axios = require(`axios`);
const _ = require(`lodash`);

const unwantedUserIds = ['USJLDB79D', 'U04FQHRNG'];

export default class RandomCoffee {
    private slackClientService = new SlackClientService()
    private userService = new UserService()

    public randomCoffee = async () => {
        const { teamId, botAccessToken } = await Workspace.findOne({ teamName: SLACK_WORKSPACE_NAME });
        const botResponseChannelId = await this.slackClientService.getResponseBotChannelId(teamId);
        const apiConfig = {
            method: `get`,
            url: `https://slack.com/api/conversations.members?pretty=1&channel=${botResponseChannelId}`,
            headers: {
                'Authorization': `Bearer ${botAccessToken}`
            }
        };
        const { data: { ok, members: channelMembers, error } } = await axios(apiConfig);
        if (ok && channelMembers.length > 0) {
            const allUsers = await this.userService.getUsers(teamId);
            let channelPeopleIds = channelMembers.filter(
                channelMember => allUsers.findIndex(member => member.userId == channelMember) != -1
            );
            channelPeopleIds = _.difference(channelPeopleIds, unwantedUserIds);
            this.postRandomCoffeeMessage(
                channelPeopleIds,
                botAccessToken,
                botResponseChannelId
            );
        }
    }

    private generateRandomIndex = (arrLength = 100) => {
        return Math.floor(Math.random() * arrLength);
    };

    private getRandomCoffeeGroup = (arr, groupSize = 4) => {
        if (arr.length <= groupSize) return arr;

        const group = [];
        while (group.length < groupSize) {
            const index = this.generateRandomIndex(arr.length);
            if (arr[index] !== undefined && group.findIndex((elem) => elem === arr[index]) === -1) {
                group.push(arr[index]);
                arr.splice(index, 1);
            }
        }

        return group;
    };

    private postRandomCoffeeMessage = async (members, botAccessToken, botResponseChannelId) => {
        members = members.map(userId => `<@${userId}>`);
        const peopleArr = [];

        while (members.length !== 0) {
            if (members.length === 10 || members.length === 5) {
                const group = this.getRandomCoffeeGroup(members, 5);
                peopleArr.push(group);
                members = _.difference(members, peopleArr[peopleArr.length - 1]);
            } else {
                const group = this.getRandomCoffeeGroup([...members]);
                peopleArr.push(group);
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
