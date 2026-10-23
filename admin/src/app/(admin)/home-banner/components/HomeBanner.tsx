'use client'

import React, { useState } from 'react'
import { Badge, Card, CardBody, CardTitle, Col, Nav, Row } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import AddHomeDrawer from './AddHomeDrawer'
import EditHomeBannerDrawer from './EditHomeBannerDrawer'
import { useDeleteHomeBannerMutation, useGetHomeBannerQuery } from '@/store/homeBanner'
import type { ILocalizedText } from '@/store/homeBanner'

const COLUMN_COUNT = 7

type Lang = 'en' | 'ar'

const LANG_TABS: { key: Lang; label: string }[] = [
  { key: 'en', label: 'English' },
  { key: 'ar', label: 'العربية (Arabic)' },
]

const isVideoUrl = (url: string) => url.includes('/video/upload/') || /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url)

// Shows the text for the selected language only (RTL for Arabic)
const LocalizedCell = ({ value, lang }: { value?: ILocalizedText; lang: Lang }) => (
  <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={lang === 'ar' ? 'text-end' : ''}>
    {value?.[lang] || '-'}
  </div>
)

const HomeBanner = () => {
  const [lang, setLang] = useState<Lang>('en')
  const { data: homeBanner = [], isLoading, isError } = useGetHomeBannerQuery()
  const [deleteHomeBanner] = useDeleteHomeBannerMutation()

  // SINGLE DELETE
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this Home Banner?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    })

    if (!result.isConfirmed) return

    try {
      await deleteHomeBanner(id).unwrap()
      toast.success('Home Banner deleted successfully')
    } catch (error: any) {
      toast.error(error?.data?.message || 'Something went wrong')
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Failed to load home banners</div>

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <div className="d-flex card-header justify-content-between align-items-center">
            <CardTitle as="h4">All Home Banner List</CardTitle>

            <AddHomeDrawer />
          </div>

          <CardBody>
            {/* Language tabs */}
            <Nav variant="tabs" activeKey={lang} onSelect={(k) => k && setLang(k as Lang)} className="mb-3">
              {LANG_TABS.map((tab) => (
                <Nav.Item key={tab.key}>
                  <Nav.Link eventKey={tab.key} as="button" type="button">
                    {tab.label}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>

            <div className="table-responsive">
              <table className="table table-hover table-bordered align-middle mb-0">
                <thead className="bg-light-subtle">
                  <tr>
                    <th>Sr No.</th>
                    <th>Title</th>
                    <th>Sub-Title</th>
                    <th>Short Desc</th>
                    <th>Image / Video</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {homeBanner.length ? (
                    homeBanner.map((item, idx) => (
                      <tr key={item._id}>
                        <td>{idx + 1}</td>
                        <td>
                          <LocalizedCell value={item.title} lang={lang} />
                        </td>
                        <td>
                          <LocalizedCell value={item.subTitle} lang={lang} />
                        </td>
                        <td>
                          <LocalizedCell value={item.shortDesc} lang={lang} />
                        </td>
                        <td>
                          {item.bgVideo ? (
                            isVideoUrl(item.bgVideo) ? (
                              <video key={item.bgVideo} src={item.bgVideo} width={120} height={70} muted controls preload="metadata" className="rounded" />
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.bgVideo} alt="Banner" width={120} height={70} className="rounded object-fit-cover" />
                            )
                          ) : (
                            <span>No Media</span>
                          )}
                        </td>
                        <td>
                          <Badge bg={item.status === 'active' ? 'success' : 'secondary'} className="text-capitalize">
                            {item.status}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <EditHomeBannerDrawer item={item} />
                            <button type="button" className="btn btn-soft-danger btn-sm" onClick={() => handleDelete(item._id)}>
                              <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={COLUMN_COUNT} className="text-center">
                        No data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default HomeBanner