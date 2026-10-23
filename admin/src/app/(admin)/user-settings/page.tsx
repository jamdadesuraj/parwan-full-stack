import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import UserSetting from './components/UserSetting'

export const metadata: Metadata = { title: 'User Settings' }

const UserSettingsPage = () => {
  return (
    <>
      <PageTItle title="User Settings" />
      <UserSetting />
    </>
  )
}

export default UserSettingsPage
