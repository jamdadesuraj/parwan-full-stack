'use client'

import React, { useMemo, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import { Card, CardBody, CardFooter, CardTitle, Col, Row } from 'react-bootstrap'

import Swal from 'sweetalert2'

import IconifyIcon from '@/components/wrappers/IconifyIcon'

import AddProductsDrawer from './AddProductsDrawer'

import { ICategoryRef, ILocalizedText, IProduct, useDeleteProductsMutation, useGetProductsQuery } from '@/store/productsApi'

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

const PRODUCTS_PER_PAGE = 9

const Products = () => {
  const { data, isLoading, isError } = useGetProductsQuery()

  const [deleteProduct] = useDeleteProductsMutation()

  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  // Hide soft-deleted products
  const products = useMemo(() => (data ?? []).filter((product) => !product.isDeleted), [data])

  // =====================================================
  // FILTER
  // =====================================================

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    if (!keyword) return products

    return products.filter((product) => {
      const searchableText = [
        product.productName?.en,
        product.productName?.ar,
        product.slug,
        product.unit,
        getCategoryLabel(product.category, ''),
        getText(product.origin),
        getText(product.grade),
        getText(product.type),
        getText(product.shelfLife),
      ]
        .join(' ')
        .toLowerCase()

      return searchableText.includes(keyword)
    })
  }, [products, search])

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  const safeCurrentPage = totalPages === 0 ? 1 : Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * PRODUCTS_PER_PAGE
  const endIndex = startIndex + PRODUCTS_PER_PAGE
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return

    setCurrentPage(page)
  }

  // =====================================================
  // SELECT
  // =====================================================

  const isAllCurrentPageSelected = currentProducts.length > 0 && currentProducts.every((product) => selectedProducts.includes(product._id))

  const handleSelectProduct = (id: string) => {
    setSelectedProducts((prev) => (prev.includes(id) ? prev.filter((productId) => productId !== id) : [...prev, id]))
  }

  const handleSelectAll = () => {
    const currentPageIds = currentProducts.map((product) => product._id)

    setSelectedProducts((prev) => {
      if (isAllCurrentPageSelected) {
        return prev.filter((id) => !currentPageIds.includes(id))
      }

      return Array.from(new Set([...prev, ...currentPageIds]))
    })
  }

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (product: IProduct) => {
    const result = await Swal.fire({
      title: 'Delete Product?',
      text: `Are you sure you want to delete "${getText(product.productName) || 'this product'}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    })

    if (!result.isConfirmed) return

    try {
      await deleteProduct(product._id).unwrap()

      setSelectedProducts((prev) => prev.filter((id) => id !== product._id))

      await Swal.fire({
        title: 'Deleted!',
        text: 'Product deleted successfully.',
        icon: 'success',
        timer: 1600,
        showConfirmButton: false,
      })
    } catch (error) {
      await Swal.fire({
        title: 'Delete Failed',
        text: getErrorMessage(error, 'Unable to delete product.'),
        icon: 'error',
      })
    }
  }

  // =====================================================
  // BULK DELETE
  // =====================================================

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return

    const count = selectedProducts.length

    const result = await Swal.fire({
      title: 'Delete Selected Products?',
      html: `You are about to delete <strong>${count}</strong> selected product${count > 1 ? 's' : ''}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, delete ${count}`,
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      focusCancel: true,
    })

    if (!result.isConfirmed) return

    setIsBulkDeleting(true)

    try {
      const results = await Promise.allSettled(selectedProducts.map((id) => deleteProduct(id).unwrap()))

      // Keep only the ones that failed selected, so the user can retry them
      const failedIds = selectedProducts.filter((_, index) => results[index].status === 'rejected')
      const successCount = results.length - failedIds.length
      const failedCount = failedIds.length

      setSelectedProducts(failedIds)

      if (failedCount === 0) {
        await Swal.fire({
          title: 'Deleted!',
          text: `${successCount} product${successCount > 1 ? 's' : ''} deleted successfully.`,
          icon: 'success',
          timer: 1800,
          showConfirmButton: false,
        })
      } else {
        await Swal.fire({
          title: 'Bulk Delete Completed',
          html: `
            <div class="text-start">
              <p class="mb-1"><strong>${successCount}</strong> deleted successfully.</p>
              <p class="mb-0 text-danger"><strong>${failedCount}</strong> failed to delete.</p>
            </div>
          `,
          icon: successCount > 0 ? 'warning' : 'error',
        })
      }
    } finally {
      setIsBulkDeleting(false)
    }
  }

  // =====================================================
  // LOADING / ERROR (all hooks are above these returns)
  // =====================================================

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />

        <div className="text-muted mt-2">Loading products...</div>
      </div>
    )
  }

  if (isError) {
    return <div className="alert alert-danger">Unable to load products. Please try again.</div>
  }

  return (
    <Row>
      <Col xl={12}>
        <Card className="border-0 shadow-sm">
          {/* HEADER */}
          <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <CardTitle as="h4" className="mb-1">
                All Products
              </CardTitle>

              <p className="text-muted mb-0">Manage product information, pricing and specifications.</p>
            </div>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              {selectedProducts.length > 0 && (
                <span className="badge bg-primary-subtle text-primary px-3 py-2">{selectedProducts.length} Selected</span>
              )}

              <button
                type="button"
                className="btn btn-danger btn-sm d-flex align-items-center gap-2"
                onClick={handleBulkDelete}
                disabled={selectedProducts.length === 0 || isBulkDeleting}
                title={
                  selectedProducts.length === 0
                    ? 'Select products to bulk delete'
                    : `Delete ${selectedProducts.length} selected product${selectedProducts.length > 1 ? 's' : ''}`
                }>
                {isBulkDeleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <IconifyIcon icon="solar:trash-bin-minimalistic-2-bold-duotone" width={17} />
                    Bulk Delete
                  </>
                )}
              </button>

              <div className="position-relative" style={{ minWidth: 250 }}>
                <input
                  type="search"
                  className="form-control ps-5"
                  placeholder="Search products..."
                  autoComplete="off"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                />

                <IconifyIcon
                  icon="solar:magnifer-linear"
                  width={18}
                  className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                />
              </div>

              <AddProductsDrawer />
            </div>
          </div>

          <CardBody>
            {/* TOP CONTROLS */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
              <div className="d-flex align-items-center gap-2">
                <input
                  id="selectAllProducts"
                  type="checkbox"
                  className="form-check-input mt-0"
                  checked={isAllCurrentPageSelected}
                  disabled={isBulkDeleting}
                  onChange={handleSelectAll}
                />

                <label htmlFor="selectAllProducts" className="mb-0 text-muted" style={{ cursor: 'pointer' }}>
                  Select all on this page
                </label>
              </div>

              <div className="text-muted small">
                <strong>{filteredProducts.length}</strong> Products
              </div>
            </div>

            {/* PRODUCT CARDS */}
            <Row className="g-4">
              {currentProducts.length > 0 ? (
                currentProducts.map((product, index) => {
                  const isSelected = selectedProducts.includes(product._id)
                  const productImage = product.images?.[0]
                  const discount = getDiscount(product)
                  const nameEn = getText(product.productName, 'en') || 'Unnamed Product'
                  const nameAr = product.productName?.ar?.trim()
                  const details = [
                    { label: 'Origin', icon: 'solar:map-point-linear', value: getText(product.origin) },
                    { label: 'Grade', icon: 'solar:medal-ribbon-star-linear', value: getText(product.grade) },
                    { label: 'Shelf Life', icon: 'solar:calendar-linear', value: getText(product.shelfLife) },
                    { label: 'Type', icon: 'solar:tag-linear', value: getText(product.type) },
                  ]

                  return (
                    <Col key={product._id} xxl={4} xl={4} lg={6} md={6} sm={12}>
                      <Card className={`product-modern-card h-100 ${isSelected ? 'product-card-selected' : ''}`}>
                        {/* IMAGE AREA */}
                        <div className="product-card-image-area">
                          <div className="product-card-checkbox">
                            <input
                              type="checkbox"
                              className="form-check-input mt-0"
                              checked={isSelected}
                              aria-label={`Select ${nameEn}`}
                              onChange={() => handleSelectProduct(product._id)}
                            />
                          </div>

                          {product.images?.length > 1 && (
                            <div className="product-card-status">
                              <span className="badge bg-dark bg-opacity-75 text-white">
                                <IconifyIcon icon="solar:gallery-bold" className="me-1" />
                                {product.images.length}
                              </span>
                            </div>
                          )}

                          {discount > 0 && <div className="product-discount-badge">-{discount}%</div>}

                          {productImage ? (
                            <Image src={productImage} alt={nameEn} width={500} height={320} unoptimized className="product-card-image" />
                          ) : (
                            <div className="product-image-placeholder">
                              <div className="text-center">
                                <IconifyIcon icon="solar:gallery-bold-duotone" width={55} />

                                <div className="small mt-2">No Image</div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* BODY */}
                        <CardBody className="p-3 d-flex flex-column">
                          <div className="mb-2">
                            <span className="product-category-badge">{getCategoryLabel(product.category)}</span>
                          </div>

                          <h5 className="product-card-name mb-1">{nameEn}</h5>

                          {nameAr && (
                            <div dir="rtl" className="text-muted small mb-2 text-end">
                              {nameAr}
                            </div>
                          )}

                          <div className="d-flex align-items-center gap-1 text-muted small mb-3">
                            <IconifyIcon icon="solar:star-bold" width={15} className="text-warning" />

                            <strong className="text-body">{Number(product.rating || 0).toFixed(1)}</strong>

                            <span>({product.review || 0} reviews)</span>
                          </div>

                          <div className="product-price-area mb-3">
                            <div className="d-flex align-items-end flex-wrap gap-2">
                              <span className="product-current-price">
                                {CURRENCY}
                                {formatPrice(product.price)}
                                <small className="text-muted fw-normal">/{product.unit}</small>
                              </span>

                              {!!product.delPrice && product.delPrice > product.price && (
                                <del className="product-old-price">
                                  {CURRENCY}
                                  {formatPrice(product.delPrice)}
                                </del>
                              )}

                              {discount > 0 && <span className="product-off-text">{discount}% OFF</span>}
                            </div>
                          </div>

                          <Row className="g-2">
                            {details.map((item) => (
                              <Col xs={6} key={item.label}>
                                <div className="product-detail-box">
                                  <div className="product-detail-icon">
                                    <IconifyIcon icon={item.icon} width={17} />
                                  </div>

                                  <div className="min-w-0">
                                    <span>{item.label}</span>

                                    <strong>{item.value || 'N/A'}</strong>
                                  </div>
                                </div>
                              </Col>
                            ))}
                          </Row>

                          <div className="d-flex justify-content-between align-items-center mt-3 product-stock-box">
                            <div className="d-flex align-items-center gap-2">
                              <div className="product-stock-icon">
                                <IconifyIcon icon="solar:box-linear" width={18} />
                              </div>

                              <div>
                                <small className="text-muted d-block">Minimum Order</small>

                                <strong>{product.minOrderQty ? `${product.minOrderQty} ${product.unit}` : 'Not set'}</strong>
                              </div>
                            </div>
                          </div>
                        </CardBody>

                        {/* FOOTER */}
                        <div className="product-card-footer border-top p-3">
                          <div className="d-flex align-items-center justify-content-between gap-2">
                            <span className="text-muted small">#{startIndex + index + 1}</span>

                            <div className="d-flex align-items-center gap-2">
                              <Link
                                href={`/products/view/${product._id}`}
                                className="btn btn-soft-info btn-sm product-action-btn"
                                title="View Product">
                                <IconifyIcon icon="solar:eye-bold-duotone" width={18} />
                              </Link>

                              <Link
                                href={`/products/edit/${product._id}`}
                                className="btn btn-soft-dark btn-sm product-action-btn"
                                title="Edit Product">
                                <IconifyIcon icon="solar:pen-2-broken" />
                              </Link>

                              <button
                                type="button"
                                className="btn btn-soft-danger btn-sm product-action-btn"
                                title="Delete Product"
                                onClick={() => handleDelete(product)}>
                                <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  )
                })
              ) : (
                <Col xs={12}>
                  <div className="text-center py-5">
                    <div className="product-empty-icon mx-auto mb-3">
                      <IconifyIcon icon="solar:box-minimalistic-linear" width={38} />
                    </div>

                    <h5 className="mb-1">No Products Found</h5>

                    <p className="text-muted mb-0">{search ? 'Try searching with another keyword.' : 'Add your first product to get started.'}</p>
                  </div>
                </Col>
              )}
            </Row>
          </CardBody>

          {/* PAGINATION */}
          <CardFooter className="bg-white border-top">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div className="text-muted small">
                Showing {filteredProducts.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredProducts.length)} of{' '}
                {filteredProducts.length} products
              </div>

              {totalPages > 1 && (
                <nav aria-label="Product pagination">
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${safeCurrentPage === 1 ? 'disabled' : ''}`}>
                      <button type="button" className="page-link" onClick={() => handlePageChange(safeCurrentPage - 1)}>
                        Previous
                      </button>
                    </li>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <li key={page} className={`page-item ${safeCurrentPage === page ? 'active' : ''}`}>
                        <button type="button" className="page-link" onClick={() => handlePageChange(page)}>
                          {page}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item ${safeCurrentPage === totalPages ? 'disabled' : ''}`}>
                      <button type="button" className="page-link" onClick={() => handlePageChange(safeCurrentPage + 1)}>
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </CardFooter>
        </Card>

        <style jsx global>{`
          .product-modern-card {
            position: relative;
            overflow: hidden;
            border: 1px solid #e7ebf0;
            border-radius: 16px;
            background: #ffffff;
            transition:
              transform 0.2s ease,
              box-shadow 0.2s ease,
              border-color 0.2s ease;
          }

          .product-modern-card:hover {
            transform: translateY(-3px);
            border-color: #cbd5e1;
            box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
          }

          .product-card-selected {
            border-color: var(--bs-primary);
            box-shadow: 0 0 0 2px rgba(var(--bs-primary-rgb), 0.08);
          }

          .product-card-image-area {
            position: relative;
            width: 100%;
            height: 220px;
            overflow: hidden;
            background: #f7f8fa;
          }

          .product-card-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
          }

          .product-modern-card:hover .product-card-image {
            transform: scale(1.03);
          }

          .product-image-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #a1a9b7;
            background: linear-gradient(135deg, #f8fafc, #f1f4f8);
          }

          .product-card-checkbox {
            position: absolute;
            top: 13px;
            left: 13px;
            z-index: 5;
            width: 34px;
            height: 34px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 9px;
            background: rgba(255, 255, 255, 0.94);
            box-shadow: 0 4px 12px rgba(15, 23, 42, 0.09);
          }

          .product-card-status {
            position: absolute;
            top: 13px;
            right: 13px;
            z-index: 5;
          }

          .product-discount-badge {
            position: absolute;
            left: 13px;
            bottom: 13px;
            z-index: 5;
            padding: 5px 9px;
            border-radius: 7px;
            color: #ffffff;
            background: #dc3545;
            font-size: 12px;
            font-weight: 700;
            box-shadow: 0 4px 12px rgba(220, 53, 69, 0.18);
          }

          .product-category-badge {
            display: inline-flex;
            align-items: center;
            padding: 4px 8px;
            border-radius: 6px;
            color: var(--bs-primary);
            background: rgba(var(--bs-primary-rgb), 0.08);
            font-size: 11px;
            font-weight: 600;
          }

          .product-card-name {
            min-height: 28px;
            color: #263244;
            font-size: 16px;
            line-height: 1.4;
            font-weight: 700;
          }

          .product-price-area {
            padding-bottom: 13px;
            border-bottom: 1px solid #edf0f4;
          }

          .product-current-price {
            color: #1e293b;
            font-size: 21px;
            font-weight: 700;
          }

          .product-old-price {
            color: #9aa4b2;
            font-size: 13px;
          }

          .product-off-text {
            color: #198754;
            font-size: 11px;
            font-weight: 700;
          }

          .product-detail-box {
            height: 100%;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 9px;
            border-radius: 9px;
            border: 1px solid #edf0f4;
            background: #fafbfc;
          }

          .product-detail-icon {
            width: 31px;
            height: 31px;
            min-width: 31px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 7px;
            color: var(--bs-primary);
            background: rgba(var(--bs-primary-rgb), 0.08);
          }

          .product-detail-box span {
            display: block;
            color: #8b95a5;
            font-size: 10px;
          }

          .product-detail-box strong {
            display: block;
            overflow: hidden;
            color: #3b4657;
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          .product-stock-box {
            padding: 10px;
            border-radius: 9px;
            background: #f8fafc;
            border: 1px solid #edf0f4;
          }

          .product-stock-icon {
            width: 34px;
            height: 34px;
            min-width: 34px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            color: var(--bs-primary);
            background: #ffffff;
            border: 1px solid #e6eaf0;
          }

          .product-card-footer {
            background: #fafbfc;
          }

          .product-action-btn {
            width: 34px;
            height: 34px;
            padding: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          .product-empty-icon {
            width: 72px;
            height: 72px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            color: var(--bs-primary);
            background: rgba(var(--bs-primary-rgb), 0.08);
          }

          .min-w-0 {
            min-width: 0;
          }

          @media (max-width: 575.98px) {
            .product-card-image-area {
              height: 200px;
            }

            .product-current-price {
              font-size: 19px;
            }
          }
        `}</style>
      </Col>
    </Row>
  )
}

export default Products
