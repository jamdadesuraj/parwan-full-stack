'use client'

import React, { useRef, useState } from 'react'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { toast } from 'react-toastify'
import { Col, Row } from 'react-bootstrap'
import { useCreateHomeBannerMutation } from '@/store/homeBanner'

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

const getInitialState = (): FormState => ({
  title: { en: '', ar: '' },
  subTitle: { en: '', ar: '' },
  shortDesc: { en: '', ar: '' },
  status: 'active',
  bgVideo: null,
})

const AddHomeDrawer = () => {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<FormState>(getInitialState)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Active language tab, and whether to flag incomplete tabs (after a submit attempt)
  const [lang, setLang] = useState<Lang>('en')
  const [showErrors, setShowErrors] = useState(false)

  const [createHomeBanner, { isLoading }] = useCreateHomeBannerMutation()

  const resetForm = () => {
    setFormData(getInitialState())
    setLang('en')
    setShowErrors(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const isTabIncomplete = (code: Lang) => TEXT_FIELDS.some(({ key }) => formData[key][code].trim().length < MIN_LENGTH)

  const handleTextChange = (key: (typeof TEXT_FIELDS)[number]['key'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: { ...prev[key], [lang]: value },
    }))
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, bgVideo: e.target.files?.[0] || null }))
  }

  const handleStatusToggle = () => {
    setFormData((prev) => ({
      ...prev,
      status: prev.status === 'active' ? 'inactive' : 'active',
    }))
  }

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
      const payload = new FormData()

      // bracket keys -> backend receives { title: { en, ar } }
      payload.append('title[en]', formData.title.en.trim())
      payload.append('title[ar]', formData.title.ar.trim())
      payload.append('subTitle[en]', formData.subTitle.en.trim())
      payload.append('subTitle[ar]', formData.subTitle.ar.trim())
      payload.append('shortDesc[en]', formData.shortDesc.en.trim())
      payload.append('shortDesc[ar]', formData.shortDesc.ar.trim())
      payload.append('status', formData.status)
      if (formData.bgVideo) payload.append('bgVideo', formData.bgVideo)

      await createHomeBanner(payload).unwrap()

      toast.success('Home Banner created successfully')
      setOpen(false)
      resetForm()
      // no refetch needed: the mutation invalidates the list tag
    } catch (error: any) {
      console.error(error)
      toast.error(error?.data?.message || 'Something went wrong')
    }
  }

  const isAr = lang === 'ar'
  const langName = isAr ? 'Arabic' : 'English'

  return (
    <>
      {/* OPEN BUTTON */}
      <button type="button" className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setOpen(true)}>
        <IconifyIcon icon="solar:add-circle-broken" />
        Add Home Banner
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
          <h5 className="mb-0 fw-bold">Add Home Banner</h5>

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
                  id: `addHomeBanner-${key}`,
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

                <div className="mb-3">
                  <label className="form-label" htmlFor="addHomeBannerMedia">
                    Image / Video (optional)
                  </label>

                  <input
                    id="addHomeBannerMedia"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="form-control"
                    onChange={handleFile}
                    disabled={isLoading}
                  />
                </div>
              </Col>

              {/* Status */}
              <Col md={12}>
                <div className="mb-3">
                  <label className="form-label d-block fw-semibold" htmlFor="addHomeBannerStatus">
                    Banner Status
                  </label>

                  <div className="d-flex align-items-center gap-3">
                    <div className="form-check form-switch mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="addHomeBannerStatus"
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
              {isLoading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default AddHomeDrawer