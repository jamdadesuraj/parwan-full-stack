'use client'

import React, { useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import Image from 'next/image'
import { toast } from 'react-toastify'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useCreatecategoryMutation } from '@/store/categoriesApi'

interface AddCategoriesDrawerProps {
  onAdd?: () => void
}

type Lang = 'en' | 'ar'

interface LocalizedText {
  en: string
  ar: string
}

interface CategoryFormData {
  categoryName: LocalizedText
  categoryDesc: LocalizedText
  img: File | null
  status: string
}

const initialFormData: CategoryFormData = {
  categoryName: { en: '', ar: '' },
  categoryDesc: { en: '', ar: '' },
  img: null,
  status: 'active',
}

const LANGS: { code: Lang; tab: string; name: string }[] = [
  { code: 'en', tab: 'English', name: 'English' },
  { code: 'ar', tab: 'العربية', name: 'Arabic' },
]

const AddCategoriesDrawer = ({ onAdd }: AddCategoriesDrawerProps) => {
  const [open, setOpen] = useState(false)

  const [createCategory, { isLoading }] = useCreatecategoryMutation()

  const [formData, setFormData] = useState<CategoryFormData>(initialFormData)

  const [previewImage, setPreviewImage] = useState('')

  // Active language tab, and whether to flag incomplete tabs (after a submit attempt)
  const [lang, setLang] = useState<Lang>('en')
  const [showErrors, setShowErrors] = useState(false)

  // Release the previous image preview URL when it changes or unmounts.
  useEffect(() => {
    return () => {
      if (previewImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage)
      }
    }
  }, [previewImage])

  const isTabIncomplete = (code: Lang) => !formData.categoryName[code].trim() || !formData.categoryDesc[code].trim()

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setFormData((prev) => ({
      ...prev,
      categoryName: { ...prev.categoryName, [lang]: value },
    }))
  }

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value

    setFormData((prev) => ({
      ...prev,
      categoryDesc: { ...prev.categoryDesc, [lang]: value },
    }))
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image')
      e.target.value = ''
      return
    }

    setFormData((prev) => ({
      ...prev,
      img: file,
    }))

    setPreviewImage(URL.createObjectURL(file))
  }

  const handleStatusToggle = () => {
    setFormData((prev) => ({
      ...prev,
      status: prev.status === 'active' ? 'inactive' : 'active',
    }))
  }

  const resetForm = () => {
    setFormData({
      ...initialFormData,
      categoryName: { en: '', ar: '' },
      categoryDesc: { en: '', ar: '' },
    })

    setPreviewImage('')
    setLang('en')
    setShowErrors(false)
  }

  const handleClose = () => {
    if (isLoading) return

    setOpen(false)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setShowErrors(true)

    // Validate both languages; jump to the first tab that is incomplete.
    for (const { code, name } of LANGS) {
      if (!formData.categoryName[code].trim()) {
        setLang(code)
        toast.error(`Please enter the ${name} category name`)
        return
      }

      if (!formData.categoryDesc[code].trim()) {
        setLang(code)
        toast.error(`Please enter the ${name} category description`)
        return
      }
    }

    if (!formData.img) {
      toast.error('Please select a category image')
      return
    }

    try {
      const payload = new FormData()

      // Bracket notation lets the server (multer + qs) rebuild nested objects:
      // req.body.categoryName = { en, ar }
      payload.append('categoryName[en]', formData.categoryName.en.trim())
      payload.append('categoryName[ar]', formData.categoryName.ar.trim())

      payload.append('categoryDesc[en]', formData.categoryDesc.en.trim())
      payload.append('categoryDesc[ar]', formData.categoryDesc.ar.trim())

      payload.append('status', formData.status)
      payload.append('categoryImg', formData.img)

      await createCategory(payload).unwrap()

      toast.success('Category created successfully')

      setOpen(false)
      resetForm()
      onAdd?.()
    } catch (error: unknown) {
      console.error('Create category error:', error)

      let message = 'Failed to create category'

      if (typeof error === 'object' && error !== null && 'data' in error) {
        const data = error.data

        if (typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string') {
          message = data.message
        }
      }

      toast.error(message)
    }
  }

  const isAr = lang === 'ar'
  const langName = isAr ? 'Arabic' : 'English'

  return (
    <>
      <button type="button" className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setOpen(true)}>
        <IconifyIcon icon="solar:add-circle-broken" />
        Add Categories
      </button>

      {/* Drawer backdrop */}
      {open && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1040,
          }}
          onClick={handleClose}
        />
      )}

      {/* Drawer */}
      <div
        className="position-fixed top-0 end-0 bg-white h-100 shadow-lg"
        style={{
          width: 520,
          maxWidth: '100%',
          zIndex: 1050,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          overflowY: 'auto',
          visibility: open ? 'visible' : 'hidden',
        }}
        aria-hidden={!open}>
        {/* Drawer header */}
        <div className="p-3 border-bottom bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">Add Categories</h5>

          <button
            type="button"
            className="btn btn-sm btn-danger rounded-circle"
            onClick={handleClose}
            disabled={isLoading}
            aria-label="Close drawer">
            ✕
          </button>
        </div>

        {/* noValidate: our own validation switches to the tab that needs attention */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-3">
            {/* Language tabs */}
            <ul className="nav nav-tabs mb-3" role="tablist">
              {LANGS.map(({ code, tab }) => {
                const flagged = showErrors && isTabIncomplete(code)

                return (
                  <li className="nav-item" key={code} role="presentation">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={lang === code}
                      className={`nav-link d-flex align-items-center gap-2 ${lang === code ? 'active' : ''}`}
                      onClick={() => setLang(code)}>
                      {tab}

                      {flagged && (
                        <span
                          className="rounded-circle bg-danger d-inline-block"
                          style={{ width: 8, height: 8 }}
                          title="Missing required fields"
                          aria-label="Missing required fields"
                        />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>

            <Row>
              {/* Fields for the open language tab */}
              <Col md={12}>
                <div className="mb-3">
                  <label htmlFor="categoryName" className="form-label fw-semibold">
                    Category Name ({langName}) *
                  </label>

                  <input
                    id="categoryName"
                    type="text"
                    className={`form-control ${showErrors && !formData.categoryName[lang].trim() ? 'is-invalid' : ''}`}
                    value={formData.categoryName[lang]}
                    onChange={handleNameChange}
                    placeholder={isAr ? 'أدخل اسم الفئة باللغة العربية' : 'Enter category name in English'}
                    dir={isAr ? 'rtl' : 'ltr'}
                    lang={lang}
                    disabled={isLoading}
                  />
                </div>
              </Col>

              <Col md={12}>
                <div className="mb-3">
                  <label htmlFor="categoryDesc" className="form-label fw-semibold">
                    Category Description ({langName}) *
                  </label>

                  <textarea
                    id="categoryDesc"
                    className={`form-control ${showErrors && !formData.categoryDesc[lang].trim() ? 'is-invalid' : ''}`}
                    value={formData.categoryDesc[lang]}
                    onChange={handleDescChange}
                    placeholder={isAr ? 'أدخل وصف الفئة باللغة العربية' : 'Enter category description in English'}
                    dir={isAr ? 'rtl' : 'ltr'}
                    lang={lang}
                    rows={4}
                    disabled={isLoading}
                  />
                </div>
              </Col>

              {/* Shared fields */}
              <Col md={12}>
                <hr />

                <p className="text-muted small mb-3">Image and status are shared by both languages.</p>

                <div className="mb-3">
                  <label htmlFor="categoryImg" className="form-label fw-semibold">
                    Category Image *
                  </label>

                  <input
                    id="categoryImg"
                    type="file"
                    className="form-control"
                    name="categoryImg"
                    accept="image/*"
                    onChange={handleFile}
                    disabled={isLoading}
                  />
                </div>
              </Col>

              {/* Image preview */}
              {previewImage && (
                <Col md={12}>
                  <div className="mb-3">
                    <label className="form-label">Image Preview</label>

                    <div className="border rounded p-2 bg-light">
                      <Image
                        src={previewImage}
                        alt="Category preview"
                        width={200}
                        height={200}
                        unoptimized
                        style={{
                          width: '100%',
                          height: 200,
                          objectFit: 'cover',
                          borderRadius: 8,
                        }}
                      />
                    </div>
                  </div>
                </Col>
              )}

              {/* Status */}
              <Col md={12}>
                <div className="mb-3">
                  <label className="form-label d-block fw-semibold" htmlFor="addCategoryStatus">
                    Category Status
                  </label>

                  <div className="d-flex align-items-center gap-3">
                    <div className="form-check form-switch mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="addCategoryStatus"
                        checked={formData.status === 'active'}
                        onChange={handleStatusToggle}
                        disabled={isLoading}
                        style={{
                          width: 46,
                          height: 24,
                          cursor: 'pointer',
                        }}
                      />
                    </div>

                    <span className={`badge ${formData.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                      {formData.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          {/* Footer buttons */}
          <div className="p-3 border-top d-flex gap-2">
            <button type="button" className="btn btn-light w-100" onClick={handleClose} disabled={isLoading}>
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2">
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm" />
                  Adding...
                </>
              ) : (
                <>
                  <IconifyIcon icon="solar:diskette-broken" />
                  Add
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default AddCategoriesDrawer