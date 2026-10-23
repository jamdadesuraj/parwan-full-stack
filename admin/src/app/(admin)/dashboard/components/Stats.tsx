'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Card, CardBody, Col, Row } from 'react-bootstrap'
import { stateData } from '../data'
import { StatType } from '../types'
import { useGetProductEnquiriesQuery } from '@/store/productEnquiriesApi'
import { useGetProductsQuery } from '@/store/productsApi'
import { useGetContactQuery } from '@/store/contactApi'

const StatsCard = ({ amount, icon, name, bg }: StatType) => (
  <Col md={4}>
    <Card className="overflow-hidden border-1" style={{ backgroundColor: bg }}>
      <CardBody>
        <Row className="align-items-center">
          <Col xs={5}>
            <div className="avatar-md bg-white bg-opacity-75 rounded flex-centered">
              <IconifyIcon icon={icon} className="fs-24" />
            </div>
          </Col>
          <Col xs={7} className="text-end">
            <p className="text-dark mb-1 text-truncate">{name}</p>
            <h4 className="text-dark mt-1 mb-0">{amount}</h4>
          </Col>
        </Row>
      </CardBody>
    </Card>
  </Col>
)

// Number -> itself, array -> length, { data | items | products | enquiries | contacts: [] } -> that array's length
const countOf = (src: any): number => {
  if (typeof src === 'number') return src
  if (Array.isArray(src)) return src.length
  for (const k of ['data', 'items', 'products', 'enquiries', 'contacts']) {
    if (Array.isArray(src?.[k])) return src[k].length
  }
  return 0
}

const Stats = () => {
  const { data: productEnquiries, isLoading: loadingEnquiries } = useGetProductEnquiriesQuery()
  const { data: contacts, isLoading: loadingContacts } = useGetContactQuery()
  const { data: products, isLoading: loadingProducts } = useGetProductsQuery()

  const live: Record<string, { loading: boolean; value: number }> = {
    'Total Products Enquiries': { loading: loadingEnquiries, value: countOf(productEnquiries) },
    'Total Contact Enquiries': { loading: loadingContacts, value: countOf(contacts) },
    'Total Products': { loading: loadingProducts, value: countOf(products) },
  }

  const cards = stateData.map((item) => {
    const entry = live[item.name]
    return { ...item, amount: entry ? (entry.loading ? '...' : entry.value.toLocaleString()) : item.amount }
  })

  return (
    <Col xxl={12}>
      <Row>
        <Col xs={12}>
          <div className="alert alert-primary text-truncate mb-3" role="alert">
            👋 Welcome to the Dashboard
          </div>
        </Col>
        {cards.map((item, idx) => (
          <StatsCard key={idx} {...item} />
        ))}
      </Row>
    </Col>
  )
}

export default Stats