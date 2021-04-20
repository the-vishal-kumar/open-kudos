import { ISlackActionBlock, ISlackCommandInfo, ISlackEventInfo } from "../controllers/definitions/slackController"
import { IGift } from "../models/gift.model"
import { IUser } from "../models/user.model"

const testTeamId = 'USERS_TEAM_ID'
const testUserId = 'U061F7AUR'
const testBuyerUserId = 'U0TESTBUR'
const receiverUserId = 'U072A8BOG'
const testUserName = 'test.test'

const slackActionBasic: ISlackActionBlock = {
  actions: [
    {
      action_id: 'buyGift',
      action_ts: '1565185476.998286',
      block_id: 'MvE',
      text: {
        text: 'test',
        type: 'plain_text',
      },
      type: 'button',
      value: '5cd95196eaaab85caf12948c',
    }
  ],
  api_app_id: 'AGA33M802',
  channel: { id: 'CHANNEL_ID', name: 'CHANNEL_ID' },
  container: {
    channel_id: 'CHANNEL_ID',
    is_ephemeral: true,
    message_ts: '1565185093.000300',
    type: 'message'
  },
  response_url: 'https://hooks.slack.com/actions/TEAM_ID/1111/fsDSgyTEsd235YH',
  team: { id: testTeamId, domain: 'TEAM_NAME' },
  token: 'SFsdgsdgdSFewrW32$dgrwefd',
  trigger_id: '719083115637.553423178486.f4b7759bf044435df81c3b4ba57c652e',
  type: 'block_actions',
  user: {
    id: testUserId,
    name: testUserName,
    team_id: testTeamId,
    username: testUserName
  },
}

const slackEventBasicObject: ISlackEventInfo = {
  api_app_id: 'A0MDYCDME',
  authed_users: [
    'U0LAN0Z89'
  ],
  event: {
    channel: 'C0LAN2Q65',
    channel_type: 'testType',
    client_msg_id: 'testId',
    event_ts: '1515449438000011',
    text: '',
    ts: '1515449438.000011',
    type: 'app_mention',
    user: testUserId,
  },
  event_id: 'Ev0MDYGDKJ',
  event_time: 1515449438000011,
  team_id: testTeamId,
  token: 'ZZZZZZWSxiZZZ2yIvs3peJ',
  type: 'event_callback',
}

const slackCommandBasicObject: ISlackCommandInfo = {
  channel_id: 'C0LAN2Q65',
  channel_name: 'test',
  command: '/kudos',
  response_url: 'test',
  team_domain: 'test',
  team_id: testTeamId,
  text: '',
  token: 'testToken',
  trigger_id: 'test',
  user_id: testUserId,
  user_name: testUserName
}

const testBuyerUserData: IUser = {
  email: 'test@test.test',
  isAdmin: true,
  kudosRenewed: 0,
  kudosGiveable: 50,
  kudosGranted: 50,
  kudosSpendable: 200,
  teamId: testTeamId,
  userId: testBuyerUserId,
  canReceiveGiftsRequest: false,
  haveExtraKudosQuota: false
}

const testUserData: IUser = {
  email: 'test2@test.test',
  isAdmin: true,
  kudosRenewed: 0,
  kudosGiveable: 50,
  kudosGranted: 50,
  kudosSpendable: 20,
  teamId: testTeamId,
  userId: testUserId,
  canReceiveGiftsRequest: false,
  haveExtraKudosQuota: false
}

const testReceiverData: IUser = {
  email: 'test3@test.test',
  isAdmin: true,
  kudosRenewed: 0,
  kudosGiveable: 50,
  kudosGranted: 50,
  kudosSpendable: 20,
  teamId: testTeamId,
  userId: receiverUserId,
  canReceiveGiftsRequest: false,
  haveExtraKudosQuota: false
}

const newUserData: IUser = {
  email: 'test4@test.test',
  isAdmin: false,
  kudosRenewed: undefined,
  kudosGiveable: undefined,
  kudosGranted: undefined,
  kudosSpendable: undefined,
  teamId: testTeamId,
  userId: 'U011C1CCC',
  canReceiveGiftsRequest: false,
  haveExtraKudosQuota: false
}

const gameGiftIndex = 0
const mugGiftIndex = 1
const monopolyGiftIndex = 2
const coffeeGiftIndex = 3

const testGifts: Array<Omit<IGift, "teamId">> = [
  {
    amount: 10,
    cost: 10,
    description: 'Cool game description',
    isAvailable: false,
    name: 'Cool-gam-2000'
  },
  {
    amount: 0,
    cost: 10,
    description: 'This is thermal mug description',
    name: 'Thermal mug'
  },
  {
    amount: 10,
    cost: 900,
    description: 'This is Monopoly Game description',
    name: 'Monopoly Game'
  },
  {
    amount: 10,
    cost: 100,
    description: 'This is Coffee description',
    name: 'Coffee'
  }
]

const realGifts: Array<Omit<IGift, "teamId">> = [
  {
    amount: 10,
    cost: 100,
    description: '',
    name: 'Chocolate / Rafaello / Craft Beer :candy:'
  },
  {
    amount: 10,
    cost: 300,
    description: '',
    name: 'Thermal mug :cup_with_straw:'
  },
  {
    amount: 10,
    cost: 400,
    description: '',
    name: 'Powerbank :zap:'
  },
  {
    amount: 10,
    cost: 400,
    description: '',
    name: 'Mug warmer :fire:'
  },
  {
    amount: 10,
    cost: 600,
    description: '',
    name: 'Cinema tickets :popcorn:'
  },
  {
    amount: 10,
    cost: 800,
    description: '',
    name: 'Hair dresser / barber :haircut:'
  },
  {
    amount: 10,
    cost: 1400,
    description: '',
    name: 'Monopoly Game :game_die:'
  },
  {
    amount: 10,
    cost: 2000,
    description: '',
    name: 'Laptop bag :handbag:'
  },
  {
    amount: 10,
    cost: 2000,
    description: '',
    name: 'Apart Bracelet :ring:'
  },
  {
    amount: 10,
    cost: 3000,
    description: '',
    name: 'Plane cabin bag :airplane_arriving:'
  },
  {
    amount: 10,
    cost: 3000,
    description: '',
    name: 'Laptop backpack :school_satchel:'
  },
  {
    amount: 10,
    cost: 4000,
    description: '',
    name: 'Lamborghini ride :police_car:'
  },
  {
    amount: 10,
    cost: 4000,
    description: '',
    name: 'KAZAR bag :handbag:'
  },
  {
    amount: 10,
    cost: 6000,
    description: '',
    name: 'NewBalance Shoes :shoe:'
  },
  {
    amount: 10,
    cost: 7000,
    description: '',
    name: 'Electric skateboard :zap:'
  },
  {
    amount: 10,
    cost: 8000,
    description: '',
    name: 'Ray Ban Glasses :eyeglasses:'
  },
  {
    amount: 10,
    cost: 9000,
    description: '',
    name: 'Weekend trip :beach_with_umbrella:'
  }
]

export {
  testUserData,
  slackEventBasicObject,
  slackActionBasic,
  testReceiverData,
  newUserData,
  testTeamId,
  testGifts,
  realGifts,
  gameGiftIndex,
  mugGiftIndex,
  monopolyGiftIndex,
  coffeeGiftIndex,
  testBuyerUserData,
  slackCommandBasicObject
}
