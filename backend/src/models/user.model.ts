import { Document, model, PaginateModel, Schema } from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

export interface IUser {
  userId: string,
  teamId: string,
  canReceiveGiftsRequest: boolean,
  haveExtraKudosQuota: boolean,
  kudosRenewed?: number,
  kudosGiveable?: number,
  kudosGranted?: number,
  kudosSpendable?: number,
  name?: string,
  realName?: string,
  isAdmin: boolean,
  email?: string
}

type IUserDocument = IUser & Document
type IUserModel<T extends Document> = PaginateModel<T>

const userSchema = new Schema<IUser>({
  email: {
    trim: true,
    type: String
  },
  isAdmin: {
    default: false,
    type: Boolean
  },
  kudosRenewed: {
    default: 0,
    min: 0,
    type: Number,
  },
  kudosGiveable: {
    default: 5,
    min: 0,
    type: Number,
  },
  kudosGranted: {
    default: 0,
    min: 0,
    type: Number
  },
  kudosSpendable: {
    default: 0,
    min: 0,
    type: Number
  },
  canReceiveGiftsRequest: {
    default: false,
    type: Boolean
  },
  haveExtraKudosQuota: {
    default: false,
    type: Boolean
  },
  teamId: {
    required: 'Slack team id is required',
    trim: true,
    type: String
  },
  userId: {
    required: 'Slack user id is required',
    trim: true,
    type: String
  }
})

userSchema.index({ teamId: 1, userId: 1 }, { unique: true })

userSchema.plugin(mongooseAggregatePaginate)

const UserModel: IUserModel<IUserDocument> =
  model<IUserDocument>('User', userSchema) as IUserModel<IUserDocument>

export default UserModel
