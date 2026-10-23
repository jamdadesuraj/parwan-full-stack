'use client'
import { ApexOptions } from 'apexcharts'
import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Col } from 'react-bootstrap'
import Link from 'next/link'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useGetProductEnquiriesQuery } from '@/store/productEnquiriesApi'

// Load Apex only in the browser so the chart always renders
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const LATEST_COUNT = 4
const COLUMN_COUNT = 8
const CHART_HEIGHT = 313

// Accepts an array or { data | items | enquiries: [] }
const toList = (src: any): any[] => {
  if (Array.isArray(src)) return src
  for (const k of ['data', 'items', 'enquiries']) {
    if (Array.isArray(src?.[k])) return src[k]
  }
  return []
}

// Date of an enquiry (falls back if createdAt is missing)
const getDate = (e: any) => new Date(e?.createdAt ?? e?.updatedAt ?? e?.date)

// "bulk_buyer" -> "Bulk Buyer"
const formatLabel = (value?: string) => (value ? value.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '-')

const formatDate = (value?: string) => {
  if (!value) return '-'
  const d = new Date(value)
  return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const statusClass = (status?: string) =>
  status === 'closed' ? 'bg-success-subtle text-success' : status === 'contacted' ? 'bg-info-subtle text-info' : 'bg-warning-subtle text-warning'

const Conversions = () => {
  const { data: productEnquiries, isLoading: loadingEnquiries } = useGetProductEnquiriesQuery()
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  const enquiries = useMemo(() => toList(productEnquiries), [productEnquiries])

  // 4 newest enquiries
  const latest = useMemo(() => [...enquiries].sort((a, b) => getDate(b).getTime() - getDate(a).getTime()).slice(0, LATEST_COUNT), [enquiries])

  // Years that have data, newest first (falls back to the current year)
  const years = useMemo(() => {
    const set = new Set<number>()
    enquiries.forEach((e) => {
      const d = getDate(e)
      if (!isNaN(d.getTime())) set.add(d.getFullYear())
    })
    if (set.size === 0) set.add(new Date().getFullYear())
    return Array.from(set).sort((a, b) => b - a)
  }, [enquiries])

  // Default to the newest year that has data
  const year = selectedYear ?? years[0]

  const monthlyCounts = useMemo(() => {
    const counts: number[] = new Array(12).fill(0)
    enquiries.forEach((e) => {
      const d = getDate(e)
      if (!isNaN(d.getTime()) && d.getFullYear() === year) counts[d.getMonth()] += 1
    })
    return counts
  }, [enquiries, year])

  const yMax = Math.max(4, Math.max(...monthlyCounts) + 1)

  const chartOptions: ApexOptions = {
    chart: { height: CHART_HEIGHT, type: 'bar', toolbar: { show: false }, animations: { enabled: false } },
    plotOptions: {
      bar: { columnWidth: '40%', borderRadius: 3, dataLabels: { position: 'top' } },
    },
    dataLabels: {
      enabled: true,
      formatter: (v) => (Number(v) > 0 ? String(v) : ''),
      offsetY: -20,
      style: { fontSize: '12px', colors: ['#6c757d'] },
    },
    xaxis: { categories: MONTHS, axisTicks: { show: false }, axisBorder: { show: false } },
    yaxis: {
      min: 0,
      max: yMax,
      tickAmount: yMax,
      labels: { formatter: (v) => Math.round(v).toString() },
      axisBorder: { show: false },
    },
    grid: {
      show: true,
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: -2, bottom: 0, left: 10 },
    },
    legend: { show: true, horizontalAlign: 'center', offsetY: 5, markers: { size: 6 } },
    colors: ['#ff6c2f'],
    noData: { text: 'No data' },
  }

  const series = [{ name: 'Product Enquiries', data: monthlyCounts }]

  return (
    <>
      {/* <Col xxl={6}>
        <Card>
          <CardBody>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <CardTitle as={'h4'}>Monthly Product Enquiries Report</CardTitle>
              <select className="form-select form-select-sm w-auto" value={year} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div dir="ltr" style={{ minHeight: CHART_HEIGHT, width: '100%' }}>
              {loadingEnquiries ? (
                <div className="d-flex align-items-center justify-content-center" style={{ height: CHART_HEIGHT }}>
                  Loading...
                </div>
              ) : (
                <ReactApexChart
                  key={`${year}-${monthlyCounts.join(',')}`}
                  options={chartOptions}
                  series={series}
                  height={CHART_HEIGHT}
                  width="100%"
                  type="bar"
                />
              )}
            </div>
          </CardBody>
        </Card>
      </Col> */}

      <Col lg={12}>
        <Card className="card-height-100">
          <CardHeader className="d-flex align-items-center justify-content-between gap-2">
            <CardTitle as={'h4'} className="grow">
              Enquiry List
            </CardTitle>
            <Link href="/product-enquires" className="btn btn-sm btn-primary">
              View All
            </Link>
          </CardHeader>
          <CardBody>
            <div className="table-responsive">
              <table className="table table-hover table-bordered align-middle mb-0">
                <thead className="bg-light-subtle">
                  <tr>
                    <th className="text-nowrap">Sr. No.</th>
                    <th className="text-nowrap">Full Name</th>
                    <th className="text-nowrap">Company / Business</th>
                    <th className="text-nowrap">Product</th>
                    <th className="text-nowrap">Quantity</th>
                    <th className="text-nowrap">Country</th>
                    <th className="text-nowrap">Status</th>
                    <th className="text-nowrap">Created At</th>
                  </tr>
                </thead>

                <tbody>
                  {loadingEnquiries ? (
                    <tr>
                      <td colSpan={COLUMN_COUNT} className="text-center py-4">
                        Loading...
                      </td>
                    </tr>
                  ) : latest.length > 0 ? (
                    latest.map((item, index) => (
                      <tr key={item._id ?? index}>
                        <td>{index + 1}</td>
                        <td className="text-nowrap">{item.fullName || '-'}</td>
                        <td>{item.companyName || '-'}</td>
                        <td>{item.product || '-'}</td>
                        <td className="text-nowrap">
                          {item.quantity} {item.unit}
                        </td>
                        <td>{item.country || '-'}</td>
                        <td>
                          <span className={`badge ${statusClass(item.status)}`}>{formatLabel(item.status)}</span>
                        </td>
                        <td className="text-nowrap">{formatDate(item.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={COLUMN_COUNT} className="text-center py-4">
                        <div className="d-flex flex-column align-items-center gap-2">
                          <IconifyIcon icon="solar:inbox-line-linear" />
                          <span>No product enquiries found.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </Col>
    </>
  )
}

export default Conversions
