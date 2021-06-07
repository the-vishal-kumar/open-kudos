import { Button, Divider, PageHeader } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import moment from 'moment'
import React, { Fragment, useState } from 'react'
import { titles } from '../../setup/messages'
import PaginatedList from '../list/PaginatedList'
import { ILeaderboard } from './models/ILeaderboard'

const LeaderboardPage: React.FC = () => {
  const endpoint = `/api/leaderboard`
  const [startDate, setStartDate] = useState(moment().startOf('week').toDate())
  const [endDate, setEndDate] = useState(moment().endOf('week').toDate())
  const [selectButton, setSelectedButton] = useState('currentWeek')

  const onButtonClick = (buttonName: string) => {
    if (buttonName === selectButton) return;
    setSelectedButton(buttonName);
    switch (buttonName) {
      case 'lastWeek':
        setStartDate(moment().startOf('week').subtract(7, 'day').toDate())
        setEndDate(moment().startOf('week').subtract(7, 'day').endOf('week').toDate())
        break;

      case 'currentMonth':
        setStartDate(moment().startOf('month').toDate())
        setEndDate(moment().endOf('month').toDate())
        break;

      case 'lastMonth':
        setStartDate(moment().startOf('month').subtract(1, 'day').startOf('month').toDate())
        setEndDate(moment().startOf('month').subtract(1, 'day').endOf('month').toDate())
        break;

      default:
        setSelectedButton('currentWeek');
        setStartDate(moment().startOf('week').toDate());
        setEndDate(moment().endOf('week').toDate());
    }
  }

  const columns: Array<ColumnProps<ILeaderboard>> = [
    {
      dataIndex: 'rank',
      key: 'rank',
      title: 'Rank',
    },
    {
      dataIndex: 'realName',
      key: 'realName',
      title: 'Name',
    },
    {
      dataIndex: 'email',
      key: 'email',
      title: 'Email',
    },
    {
      dataIndex: 'kudosGranted',
      key: 'kudosGranted',
      title: 'Kudos',
    },
  ]

  return (
    <Fragment>
      <PageHeader
        title={titles.leaderboard}
      />

      <Divider />

      <div className='buttons'>
        <Button type={selectButton === 'currentWeek' ? 'primary' : 'default'} onClick={() => onButtonClick('currentWeek')}>Current Week</Button>
        <Button type={selectButton === 'lastWeek' ? 'primary' : 'default'} onClick={() => onButtonClick('lastWeek')}>Last Week</Button>
        <Button type={selectButton === 'currentMonth' ? 'primary' : 'default'} onClick={() => onButtonClick('currentMonth')}>Current Month</Button>
        <Button type={selectButton === 'lastMonth' ? 'primary' : 'default'} onClick={() => onButtonClick('lastMonth')}>Last Month</Button>
      </div>

      <Divider />

      <PaginatedList<ILeaderboard>
        columns={columns}
        endpoint={endpoint}
        startDate={startDate}
        endDate={endDate}
        pageSize={10}
      />

    </Fragment>
  )
}

export default LeaderboardPage
