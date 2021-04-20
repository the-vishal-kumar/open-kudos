import { DocumentQuery } from "mongoose"
import ISettings, { SettingsEnum } from "../../controllers/settingsController/models/ISettings"
import Setting, { ISetting, ISettingDocument } from "../../models/setting.model"
import Workspace from "../../models/workspace.model"
import { IKudosAmountForWorkspace } from "./definitions/settingsService"
import LoggerService from "./logger"

export default class SettingsService {
  public static getDefaultSettingsIds(settings: ISettingDocument[]) {
    return settings.map(({ _id }) => _id)
  }

  private logger = new LoggerService()
  private defaultSettings: ISetting[] = [
    {
      key: SettingsEnum.BotResponseChannelId,
      value: String.empty
    },
    {
      key: SettingsEnum.WeeklyKudosAmount,
      value: '5'
    },
    {
      key: SettingsEnum.WeeklyKudosPriviledgedAmount,
      value: '15'
    },
    {
      key: SettingsEnum.GiftRequestsReceiver,
      value: String.empty
    }
  ]

  public async createDefaultSettings() {
    return await Setting.insertMany(this.defaultSettings)
  }

  public updateSetting(id: string, value: string) {
    return Setting.findByIdAndUpdate(id, { value })
  }

  public async getWorkspaceSetting(teamId: string, settingKey: string) {
    const workspace = await Workspace.findOne({ teamId }).populate('settings')
    const { settings } = workspace
    const workspaceSetting = settings.find(({ key }) => key === settingKey)

    if (settingKey === SettingsEnum.BotResponseChannelId || settingKey === SettingsEnum.GiftRequestsReceiver)
      return workspaceSetting.value || String.empty
    else
      return workspaceSetting.value || 0
  }

  public async getKudosWeeklyAmount(teamId: string): Promise<number> {
    const kudosAmount =
      await this.getWorkspaceSetting(teamId, SettingsEnum.WeeklyKudosAmount)

    return Number(kudosAmount) || Number(this.defaultSettings[1].value)
  }

  public async getKudosPriviledgedWeeklyAmount(teamId: string): Promise<number> {
    const kudosAmount =
      await this.getWorkspaceSetting(teamId, SettingsEnum.WeeklyKudosPriviledgedAmount)

    return Number(kudosAmount) || Number(this.defaultSettings[2].value)
  }

  public async updateWorkspaceSettings(teamId: string, settings: ISettings) {
    try {
      const operations:
        Array<DocumentQuery<ISettingDocument, ISettingDocument, {}>> = []
      const workspace = await Workspace.findOne({ teamId }).populate('settings')
      const { settings: workspaceSettings } = workspace

      for (const settingKey of Object.keys(settings)) {
        const workspaceSetting = workspaceSettings
          .find(({ key }) => key === settingKey)

        operations.push(this.updateSetting(
          workspaceSetting._id,
          settings[settingKey]
        ))
      }

      await Promise.all(operations)
    } catch (error) {
      this.logger.logError(error.message)
    }
  }

  public async getAllTeamsKudosWeeklyAmount() {
    const allWorkspaces = await Workspace
      .find({})
      .populate('settings')

    const weeklyKudosAmountForTeam = allWorkspaces
      .map(workspace => {
        const teamId = workspace.teamId
        const settingWeeklyKudosAmount =
          workspace
            .settings
            .find(({ key }) => key === SettingsEnum.WeeklyKudosAmount)
        const weeklyKudosAmount =
          settingWeeklyKudosAmount.value || Number(this.defaultSettings[1].value)

        const settingWeeklyKudosPriviledgedAmount =
          workspace
            .settings
            .find(({ key }) => key === SettingsEnum.WeeklyKudosPriviledgedAmount)
        const weeklyKudosPriviledgedAmount =
          settingWeeklyKudosPriviledgedAmount.value || Number(this.defaultSettings[2].value)


        return { teamId, weeklyKudosAmount, weeklyKudosPriviledgedAmount }
      })

    return weeklyKudosAmountForTeam as IKudosAmountForWorkspace[]
  }

  public async getGiftRequestsReceiver(teamId: string): Promise<string> {
    const giftRequestsReceiver =
      await this.getWorkspaceSetting(teamId, SettingsEnum.GiftRequestsReceiver)

    return giftRequestsReceiver || String.empty
  }
}
