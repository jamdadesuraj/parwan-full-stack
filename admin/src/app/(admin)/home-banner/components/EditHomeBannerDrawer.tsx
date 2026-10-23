'use client'

import React, { useEffect, useRef, useState } from 'react'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { toast } from 'react-toastify'
import { Col, Row } from 'react-bootstrap'
import { useUpdateHomeBannerMutation } from '@/store/homeBanner'
import type { IHomeBanner } from '@/store/homeBanner'

type Lang = 'en' | 'ar'

type LocalizedText = {
  en: string
  ar: string
}

type FormState = {
  title: LocalizedText
  subTitle: LocalizedText
  shortDesc: LocalizedText
  status: 'active' | 'inactive'
  bgVideo: File | null
}

const MIN_LENGTH = 2

const LANGS: { code: Lang; tab: string; name: string }[] = [
  { code: 'en', tab: 'English', name: 'English' },
  { code: 'ar', tab: 'العربية', name: 'Arabic' },
]

const TEXT_FIELDS = [
  { key: 'title', label: 'Title', multiline: false },
  { key: 'subTitle', label: 'Sub-Title', multiline: false },
  { key: 'shortDesc', label: 'Short Description', multiline: true },
] as const

const isVideoUrl = (url: string) => url.includes('/video/upload/') || /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url)

const buildFormState = (item: IHomeBanner): FormState => ({
  title: { en: item.title?.en || '', ar: item.title?.ar || '' },
  subTitle: { en: item.subTitle?.en || '', ar: item.subTitle?.ar || '' },
  shortDesc: { en: item.shortDesc?.en || '', ar: item.shortDesc?.ar || '' },
  status: item.status || 'active',
  bgVideo: null,
})

const EditHomeBannerDrawer = ({ item }: { item: IHomeBanner }) => {
  const [open, setOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [updateHomeBanner, { isLoading }] = useUpdateHomeBannerMutation()

  const [formData, setFormData] = useState<FormState>(() => buildFormState(item))

  // Active language tab, and whether to flag incomplete tabs (after a submit attempt)
  const [lang, setLang] = useState<Lang>('en')
  const [showErrors, setShowErrors] = useState(false)

  const [preview, setPreview] = useState<string>('')
  const [previewType, setPreviewType] = useState<'image' | 'video' | ''>('')

  // ============================================
  // LOAD EXISTING DATA (from the list row, no extra request)
  // ============================================

  const resetFromItem = () => {
    setFormData(buildFormState(item))
    setLang('en')
    setShowErrors(false)

    if (fileInputRef.current) fileInputRef.current.value = ''

    if (item.bgVideo) {
      setPreview(item.bgVideo)
      setPreviewType(isVideoUrl(item.bgVideo) ? 'video' : 'image')
    } else {
      setPreview('')
      setPreviewType('')
    }
  }

  // Always start from the latest saved values when the drawer opens
  // (also discards anything typed before a cancelled edit)
  const openDrawer = () => {
    resetFromItem()
    setOpen(true)
  }

  // ============================================
  // CLEANUP OBJECT URL
  // ============================================

  useEffect(() => {
    return () => {
      if (preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  // ============================================
  // INPUT CHANGE
  // ============================================

  const isTabIncomplete = (code: Lang) => TEXT_FIELDS.some(({ key }) => formData[key][code].trim().length < MIN_LENGTH)

  const handleTextChange = (key: (typeof TEXT_FIELDS)[number]['key'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: { ...prev[key], [lang]: value },
    }))
  }

  const handleStatusToggle = () => {
    setFormData((prev) => ({
      ...prev,
      status: prev.status === 'active' ? 'inactive' : 'active',
    }))
  }

  // ============================================
  // FILE CHANGE + PREVIEW
  // ============================================

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Please select a valid image or video file')
      e.target.value = ''
      return
    }

    setFormData((prev) => ({ ...prev, bgVideo: file }))
    setPreview(URL.createObjectURL(file)) // old blob is revoked by the cleanup effect
    setPreviewType(file.type.startsWith('video/') ? 'video' : 'image')
  }

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setShowErrors(true)

    // Validate both languages; jump to the first tab that is incomplete.
    for (const { code, name } of LANGS) {
      for (const { key, label } of TEXT_FIELDS) {
        if (formData[key][code].trim().length < MIN_LENGTH) {
          setLang(code)
          toast.error(`Please enter the ${name} ${label.toLowerCase()} (at least ${MIN_LENGTH} characters)`)
          return
        }
      }
    }

    try {
      const data = new FormData()

      // bracket keys -> backend receives { title: { en, ar } }
      data.append('title[en]', formData.title.en.trim())
      data.append('title[ar]', formData.title.ar.trim())
      data.append('subTitle[en]', formData.subTitle.en.trim())
      data.append('subTitle[ar]', formData.subTitle.ar.trim())
      data.append('shortDesc[en]', formData.shortDesc.en.trim())
      data.append('shortDesc[ar]', formData.shortDesc.ar.trim())
      data.append('status', formData.status)

      if (formData.bgVideo) {
        data.append('bgVideo', formData.bgVideo)
      }

      await updateHomeBanner({ id: item._id, data }).unwrap()

      toast.success('Banner updated successfully')
      setOpen(false)
      // list refetches automatically (tags); drawer re-syncs on next open
    } catch (error: any) {
      toast.error(error?.data?.message || 'Something went wrong')
    }
  }

  const isAr = lang === 'ar'
  const langName = isAr ? 'Arabic' : 'English'

  return (
    <>
      {/* OPEN BUTTON */}
      <button type="button" className="btn btn-soft-dark d-flex align-items-center gap-2" onClick={openDrawer} aria-label="Edit home banner">
        <IconifyIcon icon="solar:pen-2-broken" />
      </button>

      {/* OVERLAY */}
      {open && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1040,
          }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* DRAWER */}
      <div
        className="position-fixed top-0 end-0 bg-white h-100 shadow-lg"
        style={{
          width: '520px',
          maxWidth: '100%',
          zIndex: 1050,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          overflowY: 'auto',
        }}>
        {/* HEADER */}
        <div className="p-3 border-bottom bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">Edit Home Banner</h5>

          <button
            type="button"
            className="btn btn-sm btn-danger rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: 32, height: 32 }}
            onClick={() => setOpen(false)}
            aria-label="Close drawer">
            ✕
          </button>
        </div>

        {/* noValidate: our own validation switches to the tab that needs attention */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-3">
            {/* LANGUAGE TABS */}
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
              {/* FIELDS FOR THE OPEN LANGUAGE */}
              {TEXT_FIELDS.map(({ key, label, multiline }) => {
                const value = formData[key][lang]
                const invalid = showErrors && value.trim().length < MIN_LENGTH

                const common = {
                  id: `editHomeBanner-${key}-${item._id}`,
                  className: `form-control ${invalid ? 'is-invalid' : ''}`,
                  value,
                  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleTextChange(key, e.target.value),
                  dir: isAr ? 'rtl' : 'ltr',
                  lang,
                  disabled: isLoading,
                }

                return (
                  <Col md={12} key={key}>
                    <div className="mb-3">
                      <label htmlFor={common.id} className="form-label">
                        {label} ({langName})*
                      </label>

                      {multiline ? <textarea rows={4} {...common} /> : <input type="text" {...common} />}

                      {invalid && <div className="invalid-feedback d-block">Enter at least {MIN_LENGTH} characters.</div>}
                    </div>
                  </Col>
                )
              })}

              {/* SHARED FIELDS */}
              <Col md={12}>
                <hr />

                <p className="text-muted small mb-3">Image / video and status are shared by both languages.</p>
              </Col>

              {/* MEDIA PREVIEW */}
              {preview && (
                <Col md={12}>
                  <div className="mb-3">
                    <label className="form-label">{formData.bgVideo ? 'New Preview' : 'Current Preview'}</label>

                    <div
                      className="border rounded p-2 bg-light"
                      style={{
                        width: '100%',
                        minHeight: '200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}>
                      {previewType === 'video' && (
                        <video
                          key={preview}
                          src={preview}
                          controls
                          muted
                          playsInline
                          style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                      )}

                      {previewType === 'image' && (
                        // plain <img>: works with blob: URLs and any Cloudinary domain
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt="Banner preview" style={{ width: '100%', height: '220px', objectFit: 'contain', borderRadius: '8px' }} />
                      )}
                    </div>
                  </div>
                </Col>
              )}

              {/* FILE INPUT */}
              <Col md={12}>
                <div className="mb-3">
                  <label className="form-label" htmlFor={`editHomeBannerMedia-${item._id}`}>
                    Banner Image / Video (optional)
                  </label>

                  <input
                    id={`editHomeBannerMedia-${item._id}`}
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="form-control"
                    onChange={handleFile}
                    disabled={isLoading}
                  />

                  <small className="text-muted">Select an image or video to replace the current banner.</small>
                </div>
              </Col>

              {/* Status */}
              <Col md={12}>
                <div className="mb-3">
                  <label className="form-label d-block fw-semibold" htmlFor={`editHomeBannerStatus-${item._id}`}>
                    Banner Status
                  </label>

                  <div className="d-flex align-items-center gap-3">
                    <div className="form-check form-switch mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id={`editHomeBannerStatus-${item._id}`}
                        checked={formData.status === 'active'}
                        onChange={handleStatusToggle}
                        disabled={isLoading}
                        style={{ width: 46, height: 24, cursor: 'pointer' }}
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

          {/* FOOTER */}
          <div className="p-3 border-top d-flex gap-2">
            <button type="button" className="btn btn-light w-100" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </button>

            <button type="submit" className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" disabled={isLoading}>
              <IconifyIcon icon="solar:diskette-broken" />
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default EditHomeBannerDrawer