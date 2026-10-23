'use client'

import React, { useEffect, useState } from 'react'

import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'

import Image from 'next/image'
import { toast } from 'react-toastify'

import { useCreateSettingMutation, useGetSettingsQuery, useUpdateSettingMutation, type ILocalizedText } from '@/store/settingApi'

// =====================================================
// TYPES
// =====================================================

type Lang = 'en' | 'ar'

type LocalizedField = 'address' | 'workingHrs' | 'footerDesc' | 'footerCopyrights'

type PlainField =
  | 'mobileNo'
  | 'alternateMobileNo'
  | 'mail'
  | 'alternateEmail'
  | 'addressIframe'
  | 'facebook'
  | 'instagram'
  | 'youtube'
  | 'linkedin'
  | 'twitter'
  | 'whatsApp'

type FileField = 'logo' | 'favicon'

const LANGS: { lang: Lang; label: string }[] = [
  { lang: 'en', label: 'English' },
  { lang: 'ar', label: 'Arabic' },
]

const LOCALIZED_FIELDS: LocalizedField[] = ['address', 'workingHrs', 'footerDesc', 'footerCopyrights']

const PLAIN_FIELDS: PlainField[] = [
  'mobileNo',
  'alternateMobileNo',
  'mail',
  'alternateEmail',
  'addressIframe',
  'facebook',
  'instagram',
  'youtube',
  'linkedin',
  'twitter',
  'whatsApp',
]

const SOCIAL_FIELDS: { name: PlainField; label: string }[] = [
  { name: 'facebook', label: 'Facebook' },
  { name: 'instagram', label: 'Instagram' },
  { name: 'youtube', label: 'YouTube' },
  { name: 'linkedin', label: 'LinkedIn' },
  { name: 'twitter', label: 'Twitter / X' },
  { name: 'whatsApp', label: 'WhatsApp' },
]

// =====================================================
// HELPERS
// =====================================================

const emptyLocalized = (): ILocalizedText => ({ en: '', ar: '' })

// Safely read a localized value. Also handles legacy plain-string data.
const toLocalized = (value: unknown): ILocalizedText => {
  if (typeof value === 'string') return { en: value, ar: '' }
  const v = (value ?? {}) as Partial<ILocalizedText>
  return { en: v.en ?? '', ar: v.ar ?? '' }
}

const initialLocalized = (): Record<LocalizedField, ILocalizedText> => ({
  address: emptyLocalized(),
  workingHrs: emptyLocalized(),
  footerDesc: emptyLocalized(),
  footerCopyrights: emptyLocalized(),
})

const initialPlain = (): Record<PlainField, string> => ({
  mobileNo: '',
  alternateMobileNo: '',
  mail: '',
  alternateEmail: '',
  addressIframe: '',
  facebook: '',
  instagram: '',
  youtube: '',
  linkedin: '',
  twitter: '',
  whatsApp: '',
})

const Settings = () => {
  // ===================================================
  // API
  // ===================================================

  const [createSettings, { isLoading: isCreating }] = useCreateSettingMutation()

  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingMutation()

  const { data: settingsData, isLoading, isError, refetch } = useGetSettingsQuery()

  const settings: any = Array.isArray(settingsData) ? settingsData[0] : settingsData

  // ===================================================
  // FORM
  // ===================================================

  const [activeLang, setActiveLang] = useState<Lang>('en')
  const isRtl = activeLang === 'ar'
  const langLabel = isRtl ? 'Arabic' : 'English'

  const [plain, setPlain] = useState<Record<PlainField, string>>(initialPlain)
  const [localized, setLocalized] = useState<Record<LocalizedField, ILocalizedText>>(initialLocalized)
  const [files, setFiles] = useState<Record<FileField, File | null>>({ logo: null, favicon: null })

  const [logoPreview, setLogoPreview] = useState('')
  const [faviconPreview, setFaviconPreview] = useState('')

  // ===================================================
  // SET EXISTING DATA
  // ===================================================

  useEffect(() => {
    if (!settings) return

    const nextPlain = initialPlain()
    PLAIN_FIELDS.forEach((field) => {
      nextPlain[field] = settings[field] || ''
    })
    setPlain(nextPlain)

    const nextLocalized = initialLocalized()
    LOCALIZED_FIELDS.forEach((field) => {
      nextLocalized[field] = toLocalized(settings[field])
    })
    setLocalized(nextLocalized)

    setFiles({ logo: null, favicon: null })
    setLogoPreview(settings.logo || '')
    setFaviconPreview(settings.favicon || '')
  }, [settings])

  // ===================================================
  // CHANGE HANDLERS
  // ===================================================

  const handlePlainChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    setPlain((prev) => ({ ...prev, [name]: value }))
  }

  // Writes into the currently selected language only
  const handleLocalizedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const field = name as LocalizedField

    setLocalized((prev) => ({ ...prev, [field]: { ...prev[field], [activeLang]: value } }))
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as FileField
    const file = e.target.files?.[0] || null

    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image')
      return
    }

    setFiles((prev) => ({ ...prev, [name]: file }))

    const preview = URL.createObjectURL(file)

    if (name === 'logo') setLogoPreview(preview)
    if (name === 'favicon') setFaviconPreview(preview)
  }

  // ===================================================
  // SUBMIT
  // ===================================================

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const payload = new FormData()

      if (files.logo) payload.append('logo', files.logo)
      if (files.favicon) payload.append('favicon', files.favicon)

      PLAIN_FIELDS.forEach((field) => payload.append(field, plain[field].trim()))

      LOCALIZED_FIELDS.forEach((field) => {
        payload.append(`${field}[en]`, localized[field].en.trim())
        payload.append(`${field}[ar]`, localized[field].ar.trim())
      })

      if (settings?._id) {
        await updateSettings(payload).unwrap()
        toast.success('Settings updated successfully')
      } else {
        await createSettings(payload).unwrap()
        toast.success('Settings created successfully')
      }
    } catch (error: any) {
      console.error('Settings Error:', error)
      toast.error(error?.data?.message || 'Something went wrong')
    }
  }

  const isSubmitting = isCreating || isUpdating

  // ===================================================
  // LOADING / ERROR
  // ===================================================

  if (isLoading) {
    return (
      <div className="py-5 text-center">
        <div className="spinner-border text-primary" />

        <div className="mt-2">Loading settings...</div>
      </div>
    )
  }

  if (isError) {
    return <div className="alert alert-danger">Unable to load settings.</div>
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <Row>
      <Col xl={12}>
        <form onSubmit={onSubmit}>
          {/* =========================================
              LANGUAGE TOGGLE (affects the fields marked English / Arabic)
          ========================================= */}

          <ul className="nav nav-tabs mb-3">
            {LANGS.map(({ lang, label }) => (
              <li className="nav-item" key={lang}>
                <button type="button" className={`nav-link ${activeLang === lang ? 'active' : ''}`} onClick={() => setActiveLang(lang)}>
                  {label}
                </button>
              </li>
            ))}
          </ul>

          {/* =========================================
              GENERAL SETTINGS
          ========================================= */}

          <Card>
            <CardHeader>
              <CardTitle as="h4" className="mb-0">
                General Settings
              </CardTitle>
            </CardHeader>

            <CardBody>
              <Row>
                {/* LOGO */}

                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label">Logo</label>

                    <input type="file" name="logo" className="form-control" accept="image/*" onChange={handleFile} />

                    {logoPreview && (
                      <div className="mt-2">
                        <Image src={logoPreview} width={120} height={70} alt="Logo" className="rounded border object-fit-contain" unoptimized />
                      </div>
                    )}
                  </div>
                </Col>

                {/* FAVICON */}

                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label">Favicon</label>

                    <input type="file" name="favicon" className="form-control" accept="image/*" onChange={handleFile} />

                    {faviconPreview && (
                      <div className="mt-2">
                        <Image src={faviconPreview} width={60} height={60} alt="Favicon" className="rounded border object-fit-contain" unoptimized />
                      </div>
                    )}
                  </div>
                </Col>

                {/* MOBILE */}

                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label">Mobile No.</label>

                    <input type="text" name="mobileNo" value={plain.mobileNo} onChange={handlePlainChange} className="form-control" />
                  </div>
                </Col>

                {/* ALTERNATE MOBILE */}

                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label">Alternate Mobile No.</label>

                    <input
                      type="text"
                      name="alternateMobileNo"
                      value={plain.alternateMobileNo}
                      onChange={handlePlainChange}
                      className="form-control"
                    />
                  </div>
                </Col>

                {/* EMAIL */}

                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>

                    <input type="email" name="mail" value={plain.mail} onChange={handlePlainChange} className="form-control" />
                  </div>
                </Col>

                {/* ALTERNATE EMAIL */}

                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label">Alternate Email</label>

                    <input type="email" name="alternateEmail" value={plain.alternateEmail} onChange={handlePlainChange} className="form-control" />
                  </div>
                </Col>

                {/* ADDRESS (localized) */}

                <Col md={12}>
                  <div className="mb-3">
                    <label className="form-label">Address ({langLabel})</label>

                    <textarea
                      name="address"
                      rows={3}
                      dir={isRtl ? 'rtl' : 'ltr'}
                      value={localized.address[activeLang]}
                      onChange={handleLocalizedChange}
                      className="form-control"
                    />
                  </div>
                </Col>

                {/* MAP URL */}

                <Col md={12}>
                  <div className="mb-3">
                    <label className="form-label">Address Map URL</label>

                    <textarea
                      name="addressIframe"
                      rows={3}
                      value={plain.addressIframe}
                      onChange={handlePlainChange}
                      className="form-control"
                      placeholder="https://www.google.com/maps/embed?pb=..."
                    />

                    <div className="form-text">Paste only the Google Maps embed URL (the src value), not the full iframe code.</div>
                  </div>
                </Col>

                {/* WORKING HOURS (localized) */}

                <Col md={12}>
                  <div className="mb-3">
                    <label className="form-label">Working Hours ({langLabel})</label>

                    <input
                      type="text"
                      name="workingHrs"
                      dir={isRtl ? 'rtl' : 'ltr'}
                      value={localized.workingHrs[activeLang]}
                      onChange={handleLocalizedChange}
                      className="form-control"
                    />
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>

          {/* =========================================
              SOCIAL MEDIA
          ========================================= */}

          <Card>
            <CardHeader>
              <CardTitle as="h4" className="mb-0">
                Social Media
              </CardTitle>
            </CardHeader>

            <CardBody>
              <Row>
                {SOCIAL_FIELDS.map(({ name, label }) => (
                  <Col md={6} key={name}>
                    <div className="mb-3">
                      <label className="form-label">{label}</label>

                      <input type="url" name={name} value={plain[name]} onChange={handlePlainChange} className="form-control" />
                    </div>
                  </Col>
                ))}
              </Row>
            </CardBody>
          </Card>

          {/* =========================================
              FOOTER
          ========================================= */}

          <Card>
            <CardHeader>
              <CardTitle as="h4" className="mb-0">
                Footer
              </CardTitle>
            </CardHeader>

            <CardBody>
              <Row>
                {/* FOOTER DESCRIPTION (localized) */}

                <Col md={12}>
                  <div className="mb-3">
                    <label className="form-label">Footer Description ({langLabel})</label>

                    <textarea
                      name="footerDesc"
                      rows={4}
                      dir={isRtl ? 'rtl' : 'ltr'}
                      value={localized.footerDesc[activeLang]}
                      onChange={handleLocalizedChange}
                      className="form-control"
                    />
                  </div>
                </Col>

                {/* COPYRIGHT (localized) */}

                <Col md={12}>
                  <div className="mb-3">
                    <label className="form-label">Footer Copyrights ({langLabel})</label>

                    <input
                      type="text"
                      name="footerCopyrights"
                      dir={isRtl ? 'rtl' : 'ltr'}
                      value={localized.footerCopyrights[activeLang]}
                      onChange={handleLocalizedChange}
                      className="form-control"
                    />
                  </div>
                </Col>

                {/* SUBMIT */}

                <Col md={12}>
                  <button type="submit" className="btn btn-primary px-4" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Saving...
                      </>
                    ) : settings?._id ? (
                      'Update Settings'
                    ) : (
                      'Create Settings'
                    )}
                  </button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </form>
      </Col>
    </Row>
  )
}

export default Settings
