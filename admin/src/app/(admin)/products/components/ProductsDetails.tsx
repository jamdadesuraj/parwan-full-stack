'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Accordion, Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { ICategoryRef, ILocalizedText, IProduct, IRow, useGetProductsByIdQuery } from '@/store/productsApi'

// =====================================================
// HELPERS
// =====================================================

const CURRENCY = 'AED '

/** Returns the text for a language, falling back to the other language. */
const getText = (value?: ILocalizedText | null, lang: 'en' | 'ar' = 'en'): string => {
  if (!value) return ''

  const other = lang === 'en' ? 'ar' : 'en'

  return value[lang]?.trim() || value[other]?.trim() || ''
}

/** Category names can be a plain string or a { en, ar } object */
const toLabel = (value: unknown): string => {
  if (!value) return ''

  if (typeof value === 'string') return value

  const text = value as Partial<ILocalizedText>

  return text.en?.trim() || text.ar?.trim() || ''
}

const getCategoryLabel = (category?: ICategoryRef | null, fallback = 'N/A'): string => {
  if (!category) return fallback

  if (typeof category === 'string') return category

  return toLabel(category.categoryName) || toLabel(category.name) || category._id || fallback
}

const formatPrice = (value?: number | string): string =>
  Number(value || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })

/** Uses the virtual discountPercent when present, otherwise derives it from delPrice. */
const getDiscount = (product: IProduct): number => {
  if (product.discountPercent && product.discountPercent > 0) {
    return Math.round(product.discountPercent)
  }

  if (product.delPrice && product.delPrice > product.price) {
    return Math.round(((product.delPrice - product.price) / product.delPrice) * 100)
  }

  return 0
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  const err = error as { data?: { message?: string }; message?: string; error?: string } | undefined

  return err?.data?.message || err?.message || err?.error || fallback
}

const formatDate = (value?: string): string => {
  if (!value) return 'N/A'

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

/**
 * Renders HTML coming from the rich-text editor.
 * NOTE: sanitize with DOMPurify before rendering if this content can come from untrusted users.
 */
const renderHtml = (html?: string) => {
  if (!html || !html.trim()) {
    return <p className="text-muted mb-0">No information available.</p>
  }

  return <div className="product-rich-content" dangerouslySetInnerHTML={{ __html: html }} />
}

/** Bilingual two-column table used for specifications and packaging & delivery */
const RowsTable = ({ rows, emptyText }: { rows?: IRow[]; emptyText: string }) => {
  if (!rows || rows.length === 0) {
    return <p className="text-muted mb-0">{emptyText}</p>
  }

  return (
    <div className="table-responsive">
      <table className="table table-bordered align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th style={{ width: 50 }}>#</th>
            <th>Label (EN)</th>
            <th>Value (EN)</th>
            <th className="text-end">Label (AR)</th>
            <th className="text-end">Value (AR)</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{row.label?.en || '-'}</td>
              <td>{row.value?.en || '-'}</td>
              <td dir="rtl" className="text-end">
                {row.label?.ar || '-'}
              </td>
              <td dir="rtl" className="text-end">
                {row.value?.ar || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const ProductsDetails = () => {
  const params = useParams<{ id: string }>()

  const productId = typeof params?.id === 'string' ? params.id : ''

  const [selectedImage, setSelectedImage] = useState(0)

  // Only show the full-page spinner on the first load, not on background refetches
  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useGetProductsByIdQuery(productId, {
    skip: !productId,
  })

  if (!productId) {
    return <div className="alert alert-danger">Product id is missing.</div>
  }

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />

        <div className="text-muted mt-2">Loading product details...</div>
      </div>
    )
  }

  if (isError) {
    return <div className="alert alert-danger">{getErrorMessage(error, 'Unable to load product details.')}</div>
  }

  if (!product || product.isDeleted) {
    return <div className="alert alert-warning">Product not found.</div>
  }

  const images = product.images || []
  const activeImage = images[Math.min(selectedImage, Math.max(images.length - 1, 0))] || ''
  const discount = getDiscount(product)
  const nameEn = getText(product.productName, 'en') || 'Unnamed Product'

  const infoItems = [
    { label: 'Price', value: `${CURRENCY}${formatPrice(product.price)} / ${product.unit}` },
    {
      label: 'Old Price',
      value: product.delPrice ? `${CURRENCY}${formatPrice(product.delPrice)} / ${product.unit}` : 'N/A',
    },
    { label: 'Min. Order', value: product.minOrderQty ? `${product.minOrderQty} ${product.unit}` : 'N/A' },
    { label: 'Origin', value: getText(product.origin) || 'N/A' },
    { label: 'Grade', value: getText(product.grade) || 'N/A' },
    { label: 'Shelf Life', value: getText(product.shelfLife) || 'N/A' },
    { label: 'Type', value: getText(product.type) || 'N/A' },
    { label: 'Created', value: formatDate(product.createdAt) },
    { label: 'Updated', value: formatDate(product.updatedAt) },
  ]

  return (
    <>
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <div>
          <h4 className="mb-1 fw-bold">Product Details</h4>

          <p className="text-muted mb-0">View complete product information, specifications and FAQs.</p>
        </div>

        <div className="d-flex gap-2">
          <Link href="/products" className="btn btn-light d-flex align-items-center gap-2">
            <IconifyIcon icon="solar:arrow-left-linear" width={18} />
            Back
          </Link>

          <Link href={`/products/edit/${product._id}`} className="btn btn-primary d-flex align-items-center gap-2">
            <IconifyIcon icon="solar:pen-2-bold-duotone" width={18} />
            Edit Product
          </Link>
        </div>
      </div>

      <Row className="g-4">
        {/* GALLERY */}
        <Col xl={4}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <div className="product-details-main-image mb-3">
                {activeImage ? (
                  <Image src={activeImage} alt={nameEn} width={700} height={700} unoptimized className="w-100 h-100 object-fit-cover rounded" />
                ) : (
                  <div className="product-details-placeholder">
                    <IconifyIcon icon="solar:gallery-bold-duotone" width={55} />

                    <span className="mt-2">No Image</span>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="d-flex gap-2 flex-wrap">
                  {images.map((image, index) => (
                    <button
                      type="button"
                      key={`${image}-${index}`}
                      className={`product-details-thumb ${index === selectedImage ? 'is-active' : ''}`}
                      onClick={() => setSelectedImage(index)}
                      aria-label={`Show image ${index + 1}`}>
                      <Image src={image} alt={`${nameEn} ${index + 1}`} width={80} height={80} unoptimized className="w-100 h-100 object-fit-cover" />
                    </button>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </Col>

        {/* SUMMARY */}
        <Col xl={8}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap mb-3">
                <div>
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                    <span className="badge bg-primary-subtle text-primary">{getCategoryLabel(product.category)}</span>

                    {discount > 0 && <span className="badge bg-danger-subtle text-danger">{discount}% OFF</span>}
                  </div>

                  <h3 className="mb-1">{nameEn}</h3>

                  {product.productName?.ar && (
                    <h5 dir="rtl" className="text-muted fw-normal mb-2 text-end">
                      {product.productName.ar}
                    </h5>
                  )}

                  <div className="d-flex align-items-center gap-3 flex-wrap text-muted small">
                    <span className="d-flex align-items-center gap-1">
                      <IconifyIcon icon="solar:star-bold" width={16} className="text-warning" />
                      <strong className="text-body">{Number(product.rating || 0).toFixed(1)}</strong>({product.review || 0} reviews)
                    </span>

                    <span>Slug: {product.slug}</span>

                    <span>ID: {product._id}</span>
                  </div>
                </div>
              </div>

              <Row className="g-3">
                {infoItems.map((item) => (
                  <Col md={4} key={item.label}>
                    <div className="product-info-box">
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  </Col>
                ))}
              </Row>

              <Row className="g-3 mt-1">
                <Col md={6}>
                  <div className="product-info-box">
                    <span>Short Description (EN)</span>
                    <strong className="fw-normal">{product.shortDesc?.en || 'N/A'}</strong>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="product-info-box" dir="rtl">
                    <span>Short Description (AR)</span>
                    <strong className="fw-normal">{product.shortDesc?.ar || 'N/A'}</strong>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>

        {/* FEATURES */}
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-white">
              <h5 className="mb-0">Features</h5>
            </CardHeader>

            <CardBody>
              {product.features && product.features.length > 0 ? (
                <Row className="g-3">
                  {product.features.map((feature, index) => (
                    <Col md={6} key={index}>
                      <div className="product-spec-box">
                        <span className="d-flex align-items-center gap-2 text-body">
                          <IconifyIcon icon="solar:check-circle-bold" className="text-success" width={18} />
                          {feature.en || '-'}
                        </span>

                        <strong dir="rtl">{feature.ar || ''}</strong>
                      </div>
                    </Col>
                  ))}
                </Row>
              ) : (
                <p className="text-muted mb-0">No features added.</p>
              )}
            </CardBody>
          </Card>
        </Col>

        {/* SPECIFICATIONS */}
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-white">
              <h5 className="mb-0">Specifications</h5>
            </CardHeader>

            <CardBody>
              <RowsTable rows={product.specifications} emptyText="No specifications available." />
            </CardBody>
          </Card>
        </Col>

        {/* PACKAGING & DELIVERY */}
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-white">
              <h5 className="mb-0">Packaging & Delivery</h5>
            </CardHeader>

            <CardBody>
              <RowsTable rows={product.packagingAndDelivery} emptyText="No packaging or delivery information available." />
            </CardBody>
          </Card>
        </Col>

        {/* DESCRIPTION */}
        <Col xl={6}>
          <Card className="border-0 shadow-sm h-100">
            <CardHeader className="bg-white">
              <h5 className="mb-0">Description (EN)</h5>
            </CardHeader>

            <CardBody>{renderHtml(product.desc?.en)}</CardBody>
          </Card>
        </Col>

        <Col xl={6}>
          <Card className="border-0 shadow-sm h-100">
            <CardHeader className="bg-white">
              <h5 className="mb-0 text-end">Description (AR)</h5>
            </CardHeader>

            <CardBody dir="rtl">{renderHtml(product.desc?.ar)}</CardBody>
          </Card>
        </Col>

        {/* FAQS */}
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-white">
              <h5 className="mb-0">FAQs</h5>
            </CardHeader>

            <CardBody>
              {product.faqs && product.faqs.length > 0 ? (
                <Accordion alwaysOpen>
                  {product.faqs.map((faq, index) => (
                    <Accordion.Item eventKey={String(index)} key={index}>
                      <Accordion.Header>{faq.question?.en || faq.question?.ar || `Question ${index + 1}`}</Accordion.Header>

                      <Accordion.Body>
                        <p className="mb-2">{faq.answer?.en || '-'}</p>

                        {(faq.question?.ar || faq.answer?.ar) && (
                          <div dir="rtl" className="border-top pt-2 text-muted">
                            {faq.question?.ar && <div className="fw-semibold">{faq.question.ar}</div>}
                            <div>{faq.answer?.ar}</div>
                          </div>
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              ) : (
                <p className="text-muted mb-0">No FAQs added.</p>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <style jsx global>{`
        .product-details-main-image {
          width: 100%;
          height: 340px;
          overflow: hidden;
          border-radius: 12px;
          background: #f8fafc;
          border: 1px solid #edf0f4;
        }

        .product-details-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #9aa4b2;
        }

        .product-details-thumb {
          width: 70px;
          height: 70px;
          padding: 0;
          overflow: hidden;
          border-radius: 8px;
          border: 2px solid #e5e7eb;
          background: transparent;
          cursor: pointer;
        }

        .product-details-thumb.is-active {
          border-color: var(--bs-primary);
        }

        .product-info-box {
          height: 100%;
          padding: 13px;
          border-radius: 10px;
          border: 1px solid #edf0f4;
          background: #fafbfc;
        }

        .product-info-box span {
          display: block;
          color: #8b95a5;
          font-size: 12px;
          margin-bottom: 4px;
        }

        .product-info-box strong {
          display: block;
          color: #334155;
          font-size: 14px;
          word-break: break-word;
        }

        .product-spec-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 12px 14px;
          border: 1px solid #edf0f4;
          border-radius: 9px;
          background: #fafbfc;
        }

        .product-spec-box span {
          color: #64748b;
          font-size: 13px;
        }

        .product-spec-box strong {
          color: #334155;
          text-align: right;
        }

        .product-rich-content {
          color: #475569;
          line-height: 1.75;
        }

        .product-rich-content > :last-child {
          margin-bottom: 0;
        }

        .object-fit-cover {
          object-fit: cover;
        }

        @media (max-width: 767.98px) {
          .product-details-main-image {
            height: 260px;
          }
        }
      `}</style>
    </>
  )
}

export default ProductsDetails
