
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Col,
  Row,
} from 'react-bootstrap'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import {
  IContact,
  useDeleteContactMutation,
  useGetContactQuery,
} from '@/store/contactApi'

const ContactEnquires = () => {
  const {
    data: contactEnquires = [],
    isLoading,
    isError,
    refetch,
  } = useGetContactQuery()

  const [deleteEnquiry, { isLoading: isDeleting }] =
    useDeleteContactMutation()

  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Remove deleted records from the visible list if the API
  // returns soft-deleted enquiries.
  const activeContacts = useMemo(
    () => contactEnquires.filter((item) => !item.isDeleted),
    [contactEnquires]
  )

  // Search
  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return activeContacts

    return activeContacts.filter((item: IContact) =>
      [
        item.fullName,
        item.emailAddress,
        item.phone,
        item.companyName,
        item.productOfInterest,
        item.requiredQty,
        item.message,
      ].some((value) => value?.toLowerCase().includes(query))
    )
  }, [activeContacts, search])

  const totalPages = Math.ceil(filteredData.length / itemPerPage)
  const startIndex = (currentPage - 1) * itemPerPage

  const currentItems = filteredData.slice(
    startIndex,
    startIndex + itemPerPage
  )

  const currentPageIds = currentItems.map((item) => item._id)

  const isAllCurrentPageSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedIds.includes(id))

  // Keep the current page valid when data changes.
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }

    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  // Remove IDs that no longer exist.
  useEffect(() => {
    const existingIds = new Set(activeContacts.map((item) => item._id))

    setSelectedIds((previous) =>
      previous.filter((id) => existingIds.has(id))
    )
  }, [activeContacts])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((previous) =>
      checked
        ? [...new Set([...previous, id])]
        : previous.filter((item) => item !== id)
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds((previous) =>
      checked
        ? [...new Set([...previous, ...currentPageIds])]
        : previous.filter((id) => !currentPageIds.includes(id))
    )
  }

  const formatDate = (value?: string) => {
    if (!value) return '-'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return '-'

    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  // Single delete
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this contact enquiry?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
    })

    if (!result.isConfirmed) return

    try {
      await deleteEnquiry(id).unwrap()

      setSelectedIds((previous) =>
        previous.filter((item) => item !== id)
      )

      toast.success('Contact enquiry deleted successfully')

      // Refresh the list after deletion.
      await refetch()
    } catch (error: any) {
      console.error('Delete contact enquiry error:', error)

      toast.error(
        error?.data?.message || 'Failed to delete contact enquiry'
      )
    }
  }

  // Bulk delete
  const handleBulkDelete = async () => {
    if (!selectedIds.length) {
      toast.warning('Please select at least one enquiry')
      return
    }

    const idsToDelete = [...selectedIds]

    const result = await Swal.fire({
      title: 'Delete selected enquiries?',
      text: `You are about to delete ${idsToDelete.length} selected ${
        idsToDelete.length === 1 ? 'enquiry' : 'enquiries'
      }.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete selected',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
    })

    if (!result.isConfirmed) return

    try {
      const results = await Promise.allSettled(
        idsToDelete.map((id) => deleteEnquiry(id).unwrap())
      )

      const succeeded = results.filter(
        (result) => result.status === 'fulfilled'
      ).length

      const failed = results.length - succeeded

      setSelectedIds((previous) =>
        previous.filter((id) => !idsToDelete.includes(id))
      )

      if (succeeded > 0) {
        toast.success(
          `${succeeded} ${
            succeeded === 1 ? 'enquiry' : 'enquiries'
          } deleted successfully`
        )
      }

      if (failed > 0) {
        toast.error(`${failed} enquiries could not be deleted`)
      }

      await refetch()
    } catch (error: any) {
      console.error('Bulk delete error:', error)

      toast.error(error?.data?.message || 'Bulk delete failed')
    }
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const pageNumbers = useMemo(() => {
    const maxVisiblePages = 5
    const startPage = Math.max(
      1,
      Math.min(currentPage - 2, totalPages - maxVisiblePages + 1)
    )
    const endPage = Math.min(
      totalPages,
      startPage + maxVisiblePages - 1
    )

    return Array.from(
      { length: Math.max(0, endPage - startPage + 1) },
      (_, index) => startPage + index
    )
  }, [currentPage, totalPages])

  if (isLoading) {
    return (
      <div className="py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <div className="mt-2">Loading contact enquiries...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="alert alert-danger d-flex justify-content-between align-items-center">
        <span>Failed to load contact enquiries.</span>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <CardTitle as="h4" className="mb-1">
                Contact Enquiries
              </CardTitle>
              <small className="text-muted">
                Total {filteredData.length} enquiries
              </small>
            </div>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  className="btn btn-danger btn-sm d-flex align-items-center gap-1"
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                >
                  <IconifyIcon icon="solar:trash-bin-minimalistic-2-bold" />
                  Delete Selected ({selectedIds.length})
                </button>
              )}

              <select
                aria-label="Items per page"
                className="form-select form-select-sm"
                style={{ width: 80 }}
                value={itemPerPage}
                onChange={(e) => {
                  setItemPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>

              <div className="position-relative">
                <input
                  type="search"
                  value={search}
                  onChange={handleSearch}
                  className="form-control form-control-sm ps-4"
                  placeholder="Search enquiries..."
                  autoComplete="off"
                />

                <span className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted">
                  <IconifyIcon icon="solar:magnifer-linear" />
                </span>
              </div>
            </div>
          </div>

          <CardBody>
            <div className="table-responsive">
              <table className="table table-hover table-bordered align-middle mb-0">
                <thead className="bg-light-subtle">
                  <tr>
                    <th className="text-center" style={{ width: 45 }}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        aria-label="Select all enquiries on this page"
                        checked={isAllCurrentPageSelected}
                        onChange={(e) =>
                          handleSelectAll(e.target.checked)
                        }
                      />
                    </th>
                    <th className="text-nowrap">Sr. No.</th>
                    <th className="text-nowrap">Full Name</th>
                    <th className="text-nowrap">Email</th>
                    <th className="text-nowrap">Phone / WhatsApp</th>
                    <th className="text-nowrap">Company Name</th>
                    <th className="text-nowrap">Product of Interest</th>
                    <th className="text-nowrap">Required Qty</th>
                    <th className="text-nowrap">Message</th>
                    <th className="text-nowrap">Date</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((item, index) => (
                      <tr key={item._id}>
                        <td className="text-center">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            aria-label={`Select ${item.fullName}`}
                            checked={selectedIds.includes(item._id)}
                            onChange={(e) =>
                              handleSelectOne(
                                item._id,
                                e.target.checked
                              )
                            }
                          />
                        </td>

                        <td>{startIndex + index + 1}</td>
                        <td className="text-nowrap">
                          {item.fullName || '-'}
                        </td>
                        <td>
                          {item.emailAddress ? (
                            <a href={`mailto:${item.emailAddress}`}>
                              {item.emailAddress}
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-nowrap">
                          {item.phone || '-'}
                        </td>
                        <td>{item.companyName || '-'}</td>
                        <td>{item.productOfInterest || '-'}</td>
                        <td>{item.requiredQty || '-'}</td>
                        <td style={{ minWidth: 200, maxWidth: 320 }}>
                          <div
                            style={{
                              whiteSpace: 'pre-wrap',
                              overflowWrap: 'anywhere',
                            }}
                          >
                            {item.message || '-'}
                          </div>
                        </td>
                        <td className="text-nowrap">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-soft-danger btn-sm"
                            title="Delete enquiry"
                            aria-label={`Delete enquiry from ${item.fullName}`}
                            disabled={isDeleting}
                            onClick={() => handleDelete(item._id)}
                          >
                            <IconifyIcon icon="solar:trash-bin-minimalistic-2-bold" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={11} className="text-center py-4">
                        {search
                          ? 'No matching enquiries found'
                          : 'No contact enquiries found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>

          {filteredData.length > 0 && (
            <CardFooter className="border-top">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div className="text-muted small">
                  Showing {startIndex + 1} to{' '}
                  {Math.min(
                    startIndex + itemPerPage,
                    filteredData.length
                  )}{' '}
                  of {filteredData.length} entries
                </div>

                {totalPages > 1 && (
                  <nav aria-label="Enquiry pagination">
                    <ul className="pagination pagination-sm mb-0">
                      <li
                        className={`page-item ${
                          currentPage === 1 ? 'disabled' : ''
                        }`}
                      >
                        <button
                          type="button"
                          className="page-link"
                          disabled={currentPage === 1}
                          onClick={() =>
                            handlePageChange(currentPage - 1)
                          }
                        >
                          Previous
                        </button>
                      </li>

                      {pageNumbers.map((page) => (
                        <li
                          key={page}
                          className={`page-item ${
                            currentPage === page ? 'active' : ''
                          }`}
                        >
                          <button
                            type="button"
                            className="page-link"
                            aria-current={
                              currentPage === page ? 'page' : undefined
                            }
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        </li>
                      ))}

                      <li
                        className={`page-item ${
                          currentPage === totalPages ? 'disabled' : ''
                        }`}
                      >
                        <button
                          type="button"
                          className="page-link"
                          disabled={currentPage === totalPages}
                          onClick={() =>
                            handlePageChange(currentPage + 1)
                          }
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </div>
            </CardFooter>
          )}
        </Card>
      </Col>
    </Row>
  )
}

export default ContactEnquires
