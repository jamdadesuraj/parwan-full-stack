import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import WhyUs from './components/WhyUs'


export const metadata: Metadata = { title: 'Why Choose Us' }

const WhyUsPage = () => {
  return (
    <>
      <PageTItle title="Why Choose Us" />
      <WhyUs />
    </>
  )
}

export default WhyUsPage
