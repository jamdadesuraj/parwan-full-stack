import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'

import ProductEnquiries from './components/ProductEnquiries'

export const metadata: Metadata = { title: 'Product Enquiries' }

const ProductEnquiriesPage = () => {
  return (
    <>
      <PageTItle title="Product Enquiries" />
      <ProductEnquiries />
    </>
  )
}

export default ProductEnquiriesPage
