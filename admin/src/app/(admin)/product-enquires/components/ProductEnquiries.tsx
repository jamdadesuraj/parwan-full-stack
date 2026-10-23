
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Col,
  Row,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { IProductEnquiry, useDeleteProductEnquiryMutation, useGetProductEnquiriesQuery } from "@/store/productEnquiriesApi";


const ProductEnquiries = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const {
    data: enquiryData = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetProductEnquiriesQuery();

  const [deleteProductEnquiry, { isLoading: isDeleting }] =
    useDeleteProductEnquiryMutation();

  // Search all relevant enquiry fields.
  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return enquiryData;

    return enquiryData.filter((item) => {
      const searchableFields = [
        item.fullName,
        item.companyName,
        item.phone,
        item.email,
        item.businessType,
        item.product,
        item.quantity,
        item.unit,
        item.orderFrequency,
        item.qualityGrade,
        item.packaging,
        item.city,
        item.country,
        item.notes,
        item.status,
      ];

      return searchableFields.some((field) =>
        String(field ?? "").toLowerCase().includes(query)
      );
    });
  }, [enquiryData, search]);

  const totalPages = Math.ceil(filteredData.length / itemPerPage);
  const startIndex = (currentPage - 1) * itemPerPage;

  const currentItems = filteredData.slice(
    startIndex,
    startIndex + itemPerPage
  );

  // Keep the page valid after searching or deleting records.
  useEffect(() => {
    setCurrentPage((page) =>
      Math.max(1, Math.min(page, totalPages || 1))
    );
  }, [totalPages]);

  // Remove selections that are no longer available.
  useEffect(() => {
    const availableIds = new Set(
      filteredData.map((item) => item._id)
    );

    setSelectedIds((previous) =>
      previous.filter((id) => availableIds.has(id))
    );
  }, [filteredData]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (value: number) => {
    setItemPerPage(value);
    setCurrentPage(1);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((previous) =>
      checked
        ? Array.from(new Set([...previous, id]))
        : previous.filter((selectedId) => selectedId !== id)
    );
  };

  const currentPageIds = currentItems.map((item) => item._id);

  const allCurrentSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedIds.includes(id));

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds((previous) => {
      if (checked) {
        return Array.from(
          new Set([...previous, ...currentPageIds])
        );
      }

      return previous.filter(
        (id) => !currentPageIds.includes(id)
      );
    });
  };

  const handleDelete = async (item: IProductEnquiry) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete the enquiry from ${item.fullName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc3545",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteProductEnquiry(item._id).unwrap();

      setSelectedIds((previous) =>
        previous.filter((id) => id !== item._id)
      );

      toast.success("Product enquiry deleted successfully.");
    } catch {
      toast.error("Failed to delete product enquiry.");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const result = await Swal.fire({
      title: "Delete selected enquiries?",
      text: `You are about to delete ${selectedIds.length} enquiries.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete all!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc3545",
    });

    if (!result.isConfirmed) return;

    try {
      // Uses the existing single-delete backend endpoint.
      // The list refreshes through RTK Query tag invalidation.
      const results = await Promise.allSettled(
        selectedIds.map((id) =>
          deleteProductEnquiry(id).unwrap()
        )
      );

      const succeeded = results.filter(
        (result) => result.status === "fulfilled"
      ).length;

      const failed = results.length - succeeded;

      setSelectedIds((previous) =>
        previous.filter(
          (id) =>
            !results.some(
              (result, index) =>
                selectedIds[index] === id &&
                result.status === "fulfilled"
            )
        )
      );

      if (failed === 0) {
        toast.success(`${succeeded} enquiries deleted successfully.`);
      } else if (succeeded > 0) {
        toast.warning(
          `${succeeded} deleted successfully; ${failed} failed.`
        );
      } else {
        toast.error("Failed to delete selected enquiries.");
      }
    } catch {
      toast.error("Something went wrong while deleting enquiries.");
    }
  };

  const formatLabel = (value?: string) => {
    if (!value) return "-";

    return value
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");
  };

  const formatDate = (value?: string) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-2">Loading product enquiries...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-danger d-flex justify-content-between align-items-center">
        <span>Unable to load product enquiries.</span>
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <CardTitle as="h4" className="mb-1">
                Product Enquiries
              </CardTitle>

              <small className="text-muted">
                Total {filteredData.length} enquiries
                {search.trim() &&
                  ` (filtered from ${enquiryData.length})`}
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
                style={{ width: 85 }}
                value={itemPerPage}
                onChange={(event) =>
                  handlePageSizeChange(Number(event.target.value))
                }
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
                  onChange={(event) =>
                    handleSearch(event.target.value)
                  }
                  className="form-control form-control-sm ps-4"
                  placeholder="Search enquiries..."
                  aria-label="Search product enquiries"
                  autoComplete="off"
                />

                <span className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted">
                  <IconifyIcon icon="solar:magnifer-linear" />
                </span>
              </div>
            </div>
          </div>

          <CardBody>
            {isFetching && (
              <div
                className="text-muted small mb-2"
                role="status"
              >
                Refreshing enquiries...
              </div>
            )}

            <div className="table-responsive">
              <table className="table table-hover table-bordered align-middle mb-0">
                <thead className="bg-light-subtle">
                  <tr>
                    <th className="text-nowrap">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        aria-label="Select all enquiries on this page"
                        checked={allCurrentSelected}
                        onChange={(event) =>
                          handleSelectAll(event.target.checked)
                        }
                      />
                    </th>
                    <th className="text-nowrap">Sr. No.</th>
                    <th className="text-nowrap">Full Name</th>
                    <th className="text-nowrap">Company / Business</th>
                    <th className="text-nowrap">Phone / WhatsApp</th>
                    <th className="text-nowrap">Email Address</th>
                    <th className="text-nowrap">Business Type</th>
                    <th className="text-nowrap">Product</th>
                    <th className="text-nowrap">Quantity</th>
                    <th className="text-nowrap">Order Frequency</th>
                    <th className="text-nowrap">Quality Grade</th>
                    <th className="text-nowrap">Packaging</th>
                    <th className="text-nowrap">City</th>
                    <th className="text-nowrap">Country</th>
                    <th className="text-nowrap">Additional Notes</th>
                    <th className="text-nowrap">Status</th>
                    <th className="text-nowrap">Created At</th>
                    <th className="text-nowrap">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((item, index) => (
                      <tr key={item._id}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            aria-label={`Select enquiry from ${item.fullName}`}
                            checked={selectedIds.includes(item._id)}
                            onChange={(event) =>
                              handleSelectOne(
                                item._id,
                                event.target.checked
                              )
                            }
                          />
                        </td>

                        <td>{startIndex + index + 1}</td>
                        <td className="text-nowrap">{item.fullName}</td>
                        <td>{item.companyName || "-"}</td>
                        <td className="text-nowrap">{item.phone}</td>
                        <td>{item.email}</td>
                        <td>{formatLabel(item.businessType)}</td>
                        <td>{item.product}</td>
                        <td className="text-nowrap">
                          {item.quantity} {item.unit}
                        </td>
                        <td>{formatLabel(item.orderFrequency)}</td>
                        <td>{formatLabel(item.qualityGrade)}</td>
                        <td>{formatLabel(item.packaging)}</td>
                        <td>{item.city}</td>
                        <td>{item.country}</td>
                        <td
                          style={{
                            minWidth: 180,
                            maxWidth: 260,
                            whiteSpace: "normal",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {item.notes || "-"}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              item.status === "closed"
                                ? "bg-success-subtle text-success"
                                : item.status === "contacted"
                                  ? "bg-info-subtle text-info"
                                  : "bg-warning-subtle text-warning"
                            }`}
                          >
                            {formatLabel(item.status)}
                          </span>
                        </td>
                        <td className="text-nowrap">
                          {formatDate(item.createdAt)}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-soft-danger btn-sm"
                              title="Delete enquiry"
                              aria-label={`Delete enquiry from ${item.fullName}`}
                              onClick={() => handleDelete(item)}
                              disabled={isDeleting}
                            >
                              <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={18} className="text-center py-4">
                        <div className="d-flex flex-column align-items-center gap-2">
                          <IconifyIcon icon="solar:inbox-line-linear" />
                          <span>
                            {search.trim()
                              ? "No matching enquiries found."
                              : "No product enquiries found."}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>

          <CardFooter className="border-top">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <small className="text-muted">
                {filteredData.length > 0
                  ? `Showing ${startIndex + 1}–${Math.min(
                      startIndex + itemPerPage,
                      filteredData.length
                    )} of ${filteredData.length} enquiries`
                  : "Showing 0 enquiries"}
              </small>

              <nav aria-label="Product enquiry pagination">
                <ul className="pagination justify-content-end mb-0">
                  <li
                    className={`page-item ${
                      currentPage <= 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="page-link"
                      disabled={currentPage <= 1}
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.max(1, page - 1)
                        )
                      }
                    >
                      Previous
                    </button>
                  </li>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((pageNumber) => (
                    <li
                      key={pageNumber}
                      className={`page-item ${
                        currentPage === pageNumber ? "active" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="page-link"
                        aria-current={
                          currentPage === pageNumber ? "page" : undefined
                        }
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    </li>
                  ))}

                  <li
                    className={`page-item ${
                      currentPage >= totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="page-link"
                      disabled={
                        currentPage >= totalPages || totalPages === 0
                      }
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(totalPages, page + 1)
                        )
                      }
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </CardFooter>
        </Card>
      </Col>
    </Row>
  );
};

export default ProductEnquiries;
