// Script runs at 0400 UTC of Monday
`use strict`;

require(`dotenv`).config();
const { DB_CONNECTION_STRING } = process.env; // eslint-disable-line no-unused-vars
const { WebClient } = require('@slack/client');
const MongoClient = require(`mongodb`).MongoClient;
const axios = require(`axios`);
const moment = require(`moment`);
const _ = require(`lodash`);

let DBName = DB_CONNECTION_STRING.split(`/`)[3]
if (DBName.indexOf('?') != -1) DBName = DBName.split(`?`)[0];

MongoClient.connect(DB_CONNECTION_STRING, {
    autoIndex: false,
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
}, async (err, connection) => {
    if (err) {
        console.log(`Random Coffee Script unable to connect to database =>`, err);
        process.exit(1);
    } else {
        let database = connection.db(DBName);
        const workspace = await database.collection(`workspaces`).findOne({ teamName: `devops` })
        const botResponseChannelIdSetting = await database.collection(`settings`).findOne({ key: `botResponseChannelId`, _id: { $in: workspace.settings } });
        const apiConfig = {
            method: `get`,
            url: `https://slack.com/api/conversations.members?pretty=1&channel=${botResponseChannelIdSetting.value}`,
            headers: {
                'Authorization': `Bearer ${workspace.botAccessToken}`
            }
        };
        let { data
            : { ok, members: membersIdArray, error }
        } = await axios(apiConfig);
        if (ok && membersIdArray.length > 0) {
            randomCoffee(membersIdArray.filter(userId => userId != workspace.botUserId), workspace.botAccessToken, botResponseChannelIdSetting.value);
        }
    }
});

const generateRandomIndex = (arrLength = 100) => {
    return parseInt(Math.random() * arrLength, 10);
};

const getRandomCoffeeGroup = (arr, groupSize = 4) => {
    if (arr.length <= groupSize) return arr;

    const group = [];
    for (let i = 0; i < groupSize; i++) {
        const index = generateRandomIndex(arr.length);
        group.push(arr[index]);
        arr.splice(index, 1);
    }

    return group;
};

const randomCoffee = async (members, botAccessToken, botResponseChannelId) => {
    if (moment().isoWeekday() === 1) {

        members = members.map(userId => `<@${userId}>`);

        const peopleArr = [];

        while (members.length !== 0) {
            if (members.length === 10 || members.length === 5) {
                const x = getRandomCoffeeGroup(members, 5);
                peopleArr.push(x);
                members = _.difference(members, peopleArr[peopleArr.length - 1]);
            } else {
                const x = getRandomCoffeeGroup([...members]);
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
    }
};
