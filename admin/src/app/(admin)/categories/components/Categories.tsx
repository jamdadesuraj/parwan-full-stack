'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardBody, CardTitle, Col, Row } from 'react-bootstrap'
import Image from 'next/image'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import AddCategoriesDrawer from './AddCategoriesDrawer'
import EditCategoriesDrawer from './EditCategoriesDrawer'

import { useDeletecategoryMutation, useGetcategoryQuery, type ICategory, type ILocalizedText } from '@/store/categoriesApi'

type Lang = 'en' | 'ar'

const LANGS: { code: Lang; tab: string }[] = [
  { code: 'en', tab: 'English' },
  { code: 'ar', tab: 'العربية (Arabic)' },
]

// Supports localized objects and plain strings from the API.
const getLocalizedText = (value: ILocalizedText | string | null | undefined): { en: string; ar: string } => {
  if (typeof value === 'string') {
    return { en: value, ar: '' }
  }

  if (value && typeof value === 'object') {
    return {
      en: value.en || '',
      ar: value.ar || '',
    }
  }

  return { en: '', ar: '' }
}

// Shows the text for the selected language tab.
// If that language is missing, falls back to the other one (muted, with a language tag).
const LocalizedCell = ({ value, lang }: { value: ILocalizedText | string | null | undefined; lang: Lang }) => {
  const localized = getLocalizedText(value)
  const other: Lang = lang === 'en' ? 'ar' : 'en'

  if (localized[lang]) {
    return (
      <span dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang} className={`d-block ${lang === 'ar' ? 'text-end' : 'text-start'}`}>
        {localized[lang]}
      </span>
    )
  }

  if (localized[other]) {
    return (
      <span
        dir={other === 'ar' ? 'rtl' : 'ltr'}
        lang={other}
        className={`d-block text-muted fst-italic ${other === 'ar' ? 'text-end' : 'text-start'}`}
        title={`Not translated. Showing ${other === 'en' ? 'English' : 'Arabic'}.`}>
        {localized[other]} <span className="badge bg-warning-subtle text-warning">{other.toUpperCase()}</span>
      </span>
    )
  }

  return <span className="text-muted">-</span>
}

const Categories = () => {
  const { data: categories = [], isLoading, isError } = useGetcategoryQuery()

  const [deleteCategory, { isLoading: isDeleting }] = useDeletecategoryMutation()

  const [lang, setLang] = useState<Lang>('en')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // How many categories are missing a name or description in each language.
  const missingCount = useMemo(() => {
    const count: Record<Lang, number> = { en: 0, ar: 0 }

    categories.forEach((item: ICategory) => {
      const name = getLocalizedText(item.categoryName)
      const description = getLocalizedText(item.categoryDesc)

      LANGS.forEach(({ code }) => {
        if (!name[code].trim() || !description[code].trim()) count[code] += 1
      })
    })

    return count
  }, [categories])

  // Search using both English and Arabic values.
  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return categories

    return categories.filter((item: ICategory) => {
      const name = getLocalizedText(item.categoryName)
      const description = getLocalizedText(item.categoryDesc)
      const status = (item.status || '').toLowerCase()

      return (
        name.en.toLowerCase().includes(query) ||
        name.ar.toLowerCase().includes(query) ||
        description.en.toLowerCase().includes(query) ||
        description.ar.toLowerCase().includes(query) ||
        status.includes(query)
      )
    })
  }, [categories, search])

  const totalPages = Math.ceil(filteredCategories.length / perPage)
  const startIndex = (currentPage - 1) * perPage

  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + perPage)

  // Keep the current page valid after searching or deleting.
  useEffect(() => {
    if (currentPage > Math.max(totalPages, 1)) {
      setCurrentPage(Math.max(totalPages, 1))
    }
  }, [currentPage, totalPages])

  // Remove selected IDs that no longer exist.
  useEffect(() => {
    const existingIds = new Set(categories.map((item) => item._id))

    setSelectedIds((previous) => previous.filter((id) => existingIds.has(id)))
  }, [categories])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((previous) => (checked ? [...new Set([...previous, id])] : previous.filter((item) => item !== id)))
  }

  const currentPageIds = paginatedCategories.map((item) => item._id)

  const isAllCurrentPageSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id))

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds((previous) => [...new Set([...previous, ...currentPageIds])])
    } else {
      setSelectedIds((previous) => previous.filter((id) => !currentPageIds.includes(id)))
    }
  }

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this category?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    })

    if (!result.isConfirmed) return

    try {
      await deleteCategory(id).unwrap()

      setSelectedIds((previous) => previous.filter((item) => item !== id))

      toast.success('Category deleted successfully')
    } catch (error: unknown) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'data' in error &&
        typeof error.data === 'object' &&
        error.data !== null &&
        'message' in error.data
          ? String(error.data.message)
          : 'Something went wrong'

      toast.error(message)
    }
  }

  const handleBulkDelete = async () => {
    if (!selectedIds.length) {
      toast.warning('Please select at least one category')
      return
    }

    const idsToDelete = [...selectedIds]

    const result = await Swal.fire({
      title: 'Delete selected categories?',
      text: `You are about to delete ${idsToDelete.length} selected categor${idsToDelete.length > 1 ? 'ies' : 'y'}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete selected',
      cancelButtonText: 'Cancel',
    })

    if (!result.isConfirmed) return

    try {
      await Promise.all(idsToDelete.map((id) => deleteCategory(id).unwrap()))

      toast.success(`${idsToDelete.length} categor${idsToDelete.length > 1 ? 'ies' : 'y'} deleted successfully`)

      setSelectedIds([])

      const selectedOnCurrentPage = currentPageIds.filter((id) => idsToDelete.includes(id)).length

      if (selectedOnCurrentPage === paginatedCategories.length && currentPage > 1) {
        setCurrentPage((previous) => previous - 1)
      }
    } catch (error: unknown) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'data' in error &&
        typeof error.data === 'object' &&
        error.data !== null &&
        'message' in error.data
          ? String(error.data.message)
          : 'Bulk delete failed'

      toast.error(message)
    }
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)

  if (isLoading) {
    return <div className="py-4 text-center">Loading categories...</div>
  }

  if (isError) {
    return <div className="py-4 text-center text-danger">Error loading categories. Please refresh the page and try again.</div>
  }

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <CardTitle as="h4" className="mb-1">
                All Categories List
              </CardTitle>

              <small className="text-muted">Total {filteredCategories.length} categories</small>
            </div>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  className="btn btn-danger btn-sm d-flex align-items-center gap-1"
                  onClick={handleBulkDelete}
                  disabled={isDeleting}>
                  <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" />
                  Delete Selected ({selectedIds.length})
                </button>
              )}

              <select
                aria-label="Items per page"
                className="form-select form-select-sm"
                style={{ width: '80px' }}
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>

              <div className="position-relative">
                <input
                  type="search"
                  className="form-control form-control-sm ps-4"
                  placeholder="Search categories..."
                  autoComplete="off"
                  value={search}
                  onChange={handleSearch}
                />

                <IconifyIcon icon="solar:magnifer-linear" className="position-absolute top-50 inset-s-0 translate-middle-y ms-2 text-muted" />
              </div>

              <AddCategoriesDrawer />
            </div>
          </div>

          <CardBody>
            {/* Language tabs: choose which language the table shows */}
            <ul className="nav nav-tabs mb-3" role="tablist">
              {LANGS.map(({ code, tab }) => (
                <li className="nav-item" key={code} role="presentation">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={lang === code}
                    className={`nav-link d-flex align-items-center gap-2 ${lang === code ? 'active' : ''}`}
                    onClick={() => setLang(code)}>
                    {tab}

                    {missingCount[code] > 0 && (
                      <span
                        className="badge bg-warning-subtle text-warning"
                        title={`${missingCount[code]} categor${
                          missingCount[code] > 1 ? 'ies are' : 'y is'
                        } missing a ${code === 'en' ? 'English' : 'Arabic'} name or description`}>
                        {missingCount[code]}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            <div className="table-responsive">
              <table className="table table-hover table-bordered align-middle mb-0">
                <thead className="bg-light-subtle">
                  <tr>
                    <th className="text-center" style={{ width: '45px' }}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        aria-label="Select all categories on this page"
                        checked={isAllCurrentPageSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>

                    <th className="text-nowrap">Sr No.</th>
                    <th className="text-nowrap">Image</th>
                    <th className="text-nowrap">Category Name</th>
                    <th className="text-nowrap">Category Desc</th>
                    <th className="text-nowrap">Status</th>
                    <th className="text-nowrap">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedCategories.length > 0 ? (
                    paginatedCategories.map((item, index) => {
                      const localizedName = getLocalizedText(item.categoryName)
                      const imageUrl = item.categoryImg
                      const isActive = item.status?.toLowerCase() === 'active'

                      return (
                        <tr key={item._id}>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              aria-label={`Select ${localizedName.en || localizedName.ar || 'category'}`}
                              checked={selectedIds.includes(item._id)}
                              onChange={(e) => handleSelectOne(item._id, e.target.checked)}
                            />
                          </td>

                          <td>{startIndex + index + 1}</td>

                          <td>
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={localizedName.en || localizedName.ar || 'Category'}
                                width={50}
                                height={50}
                                className="rounded object-fit-cover"
                                style={{ objectFit: 'cover' }}
                              />
                            ) : (
                              <span className="text-muted">No Image</span>
                            )}
                          </td>

                          <td style={{ minWidth: '160px' }}>
                            <LocalizedCell value={item.categoryName} lang={lang} />
                          </td>

                          <td style={{ minWidth: '220px', maxWidth: '300px' }}>
                            <LocalizedCell value={item.categoryDesc} lang={lang} />
                          </td>

                          <td>
                            <span className={`badge ${isActive ? 'bg-success' : 'bg-danger'}`}>{item.status || 'Unknown'}</span>
                          </td>

                          <td>
                            <div className="d-flex gap-2">
                              <EditCategoriesDrawer item={item} />

                              <button
                                type="button"
                                className="btn btn-soft-danger btn-sm"
                                onClick={() => handleDelete(item._id)}
                                disabled={isDeleting}
                                aria-label={`Delete ${localizedName.en || localizedName.ar || 'category'}`}
                                title="Delete category">
                                <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-4">
                        No data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredCategories.length > 0 && (
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-3">
                <div className="text-muted small">
                  Showing {startIndex + 1} to {Math.min(startIndex + perPage, filteredCategories.length)} of {filteredCategories.length} entries
                </div>

                <nav aria-label="Categories pagination">
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button type="button" className="page-link" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
                        Previous
                      </button>
                    </li>

                    {pageNumbers.map((page) => (
                      <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                        <button
                          type="button"
                          className="page-link"
                          onClick={() => handlePageChange(page)}
                          aria-current={currentPage === page ? 'page' : undefined}>
                          {page}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        type="button"
                        className="page-link"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}>
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default Categories
