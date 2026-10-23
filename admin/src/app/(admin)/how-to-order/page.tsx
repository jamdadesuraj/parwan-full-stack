import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import HowToOrder from './components/HowToOrder'



export const metadata: Metadata = { title: 'How To Order' }

const HowToOrderPage = () => {
  return (
    <>
      <PageTItle title="How To Order" />
      <HowToOrder />
    </>
  )
}

export default HowToOrderPage
