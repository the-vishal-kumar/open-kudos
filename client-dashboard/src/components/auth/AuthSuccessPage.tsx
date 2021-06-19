import React, { useEffect } from 'react'
import { withRouter, RouteComponentProps } from 'react-router'
import { Redirect } from 'react-router-dom'
import { dashboardRoutes } from '../../setup/config'
import { useDispatch } from 'react-redux'
import { login } from './actions';

interface IAccessTokenParams {
  accessToken: string
}

const AuthSuccessPage: React.FC<RouteComponentProps<IAccessTokenParams>> = (props) => {
  const { accessToken } = props.match.params
  const dispatch = useDispatch()

  useEffect(() => {
    login(accessToken)(dispatch)
  })

  return (
    <Redirect to={dashboardRoutes.leaderboardPage} />
  )
}

export default withRouter(AuthSuccessPage)
