import { Button, Divider, PageHeader } from 'antd'
import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { dashboardRoutes } from '../../setup/config'
import { titles } from '../../setup/messages'
import { GiftList } from './GiftList'


const GiftPage: React.FC = () => (
  <Fragment>
    <PageHeader
      title={titles.gifts}
      extra={[
        <Button key='add-gift'>
          <Link to={dashboardRoutes.newGiftPage}>
            Add new
          </Link>
        </Button>
      ]}
    />
    <Divider />
    <GiftList />
  </Fragment>
)

export default GiftPage
