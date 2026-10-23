'use client'

import React, { useEffect, useMemo, useState } from 'react'

import dynamic from 'next/dynamic'

import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'

import { toast } from 'react-toastify'

import { useCreatePrivacyMutation, useGetPrivacyQuery, useUpdatePrivacyMutation, type ILocalizedText } from '@/store/privacyPolicyApi'

// @ts-ignore
import 'react-quill-new/dist/quill.snow.css'

// Quill touches `document`, so it must only render on the client.
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

// ---------- types ----------
type Lang = 'en' | 'ar'
type Field = 'title' | 'subTitle' | 'shortDesc' | 'content'

type PrivacyFormData = Record<Field, ILocalizedText>

const LANGS: { lang: Lang; label: string }[] = [
  { lang: 'en', label: 'English' },
  { lang: 'ar', label: 'Arabic' },
]

const FIELD_LABELS: Record<Field, string> = {
  title: 'Title',
  subTitle: 'Sub Title',
  shortDesc: 'Short Description',
  content: 'Content',
}

const FIELDS: Field[] = ['title', 'subTitle', 'shortDesc', 'content']

// ---------- helpers ----------
const emptyForm = (): PrivacyFormData => ({
  title: { en: '', ar: '' },
  subTitle: { en: '', ar: '' },
  shortDesc: { en: '', ar: '' },
  content: { en: '', ar: '' },
})

// Safely read a localized value. Also handles legacy plain-string data.
const toLocalized = (value: unknown): ILocalizedText => {
  if (typeof value === 'string') return { en: value, ar: '' }
  const v = (value ?? {}) as Partial<ILocalizedText>
  return { en: v.en ?? '', ar: v.ar ?? '' }
}

// Accepts { data: [...] }, { data: {...} }, [...] or {...} and returns one document (or null).
const normalizeResponse = (response: any) => {
  if (!response) return null

  const payload = response.data ?? response

  return Array.isArray(payload) ? (payload[0] ?? null) : payload
}

// Quill reports "<p><br></p>" for an empty editor, so strip tags before checking.
// Content that only contains media (image, video, iframe) still counts as filled.
const isQuillEmpty = (value: string) => {
  if (/<(img|iframe|video)/i.test(value)) return false

  const text = value
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()

  return !text
}

const isFieldEmpty = (field: Field, value: string) => (field === 'content' ? isQuillEmpty(value ?? '') : !(value ?? '').trim())

const isLangIncomplete = (form: PrivacyFormData, lang: Lang) => FIELDS.some((field) => isFieldEmpty(field, form[field][lang]))

// ---------- component ----------
const PrivacyPolicy = () => {
  const { data: privacyResponse, isLoading, isError, error, refetch } = useGetPrivacyQuery()

  const [createPrivacy, { isLoading: creating }] = useCreatePrivacyMutation()
  const [updatePrivacy, { isLoading: updating }] = useUpdatePrivacyMutation()

  const [formData, setFormData] = useState<PrivacyFormData>(emptyForm)
  const [activeLang, setActiveLang] = useState<Lang>('en')
  const [submitted, setSubmitted] = useState(false)

  const privacy = useMemo(() => normalizeResponse(privacyResponse), [privacyResponse])

  // A 404 just means nothing has been created yet, so the empty form should still show.
  const notFound = isError && (error as any)?.status === 404

  const isSaving = creating || updating
  const isRtl = activeLang === 'ar'

  useEffect(() => {
    if (!privacy) return

    setFormData({
      title: toLocalized(privacy.title),
      // falls back to the old badgeTitle field for legacy data
      subTitle: toLocalized(privacy.subTitle ?? privacy.badgeTitle),
      shortDesc: toLocalized(privacy.shortDesc),
      content: toLocalized(privacy.content),
    })
  }, [privacy])

  const handleChange = (field: Field, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: { ...prev[field], [activeLang]: value } }))
  }

  const invalid = (field: Field) => submitted && isFieldEmpty(field, formData[field][activeLang])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)

    for (const { lang, label } of LANGS) {
      const missing = FIELDS.find((field) => isFieldEmpty(field, formData[field][lang]))

      if (missing) {
        setActiveLang(lang)
        toast.error(`${FIELD_LABELS[missing]} is required in the ${label} tab`)
        return
      }
    }

    const payload = {
      title: { en: formData.title.en.trim(), ar: formData.title.ar.trim() },
      subTitle: { en: formData.subTitle.en.trim(), ar: formData.subTitle.ar.trim() },
      shortDesc: { en: formData.shortDesc.en.trim(), ar: formData.shortDesc.ar.trim() },
      content: formData.content,
    }

    try {
      if (privacy?._id) {
        await updatePrivacy({ _id: privacy._id, ...payload }).unwrap()
        toast.success('Privacy Policy updated successfully')
      } else {
        await createPrivacy(payload).unwrap()
        toast.success('Privacy Policy created successfully')
      }

      setSubmitted(false)
      await refetch()
    } catch (err: any) {
      console.error('Privacy Policy error:', err)
      toast.error(err?.data?.message || 'Something went wrong')
    }
  }

  if (isLoading) {
    return (
      <div className="py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <div className="mt-2">Loading Privacy Policy...</div>
      </div>
    )
  }

  if (isError && !notFound) {
    return <div className="alert alert-danger">Unable to load Privacy Policy.</div>
  }

  const buttonLabel = isSaving ? (privacy?._id ? 'Updating...' : 'Creating...') : privacy?._id ? 'Update Privacy Policy' : 'Create Privacy Policy'

  return (
    <form onSubmit={handleSubmit}>
      <style>{`
        .privacy-editor .ql-editor { min-height: 300px; }
        .privacy-editor.is-rtl .ql-editor { direction: rtl; text-align: right; }
        .privacy-editor.is-invalid-editor .ql-toolbar,
        .privacy-editor.is-invalid-editor .ql-container { border-color: var(--bs-danger, #dc3545); }
      `}</style>

      {/* LANGUAGE TOGGLE */}
      <ul className="nav nav-tabs mb-3">
        {LANGS.map(({ lang, label }) => {
          const incomplete = submitted && isLangIncomplete(formData, lang)

          return (
            <li className="nav-item" key={lang}>
              <button
                type="button"
                className={`nav-link ${activeLang === lang ? 'active' : ''} ${incomplete ? 'text-danger' : ''}`}
                onClick={() => setActiveLang(lang)}>
                {label}
                {incomplete && <span className="ms-1">*</span>}
              </button>
            </li>
          )
        })}
      </ul>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle as="h4" className="mb-0">
            Privacy Policy ({activeLang === 'en' ? 'English' : 'Arabic'})
          </CardTitle>
        </CardHeader>

        <CardBody>
          <Row>
            <Col md={6}>
              <div className="mb-3">
                <label htmlFor="subTitle" className="form-label">
                  Sub Title
                  <span className="text-danger ms-1">*</span>
                </label>

                <input
                  id="subTitle"
                  type="text"
                  className={`form-control ${invalid('subTitle') ? 'is-invalid' : ''}`}
                  dir={isRtl ? 'rtl' : 'ltr'}
                  value={formData.subTitle[activeLang]}
                  onChange={(e) => handleChange('subTitle', e.target.value)}
                  placeholder={isRtl ? 'مثال: الخصوصية والأمان' : 'e.g. Privacy & Security'}
                />
              </div>
            </Col>

            <Col md={6}>
              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  Title
                  <span className="text-danger ms-1">*</span>
                </label>

                <input
                  id="title"
                  type="text"
                  className={`form-control ${invalid('title') ? 'is-invalid' : ''}`}
                  dir={isRtl ? 'rtl' : 'ltr'}
                  value={formData.title[activeLang]}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder={isRtl ? 'مثال: سياسة الخصوصية' : 'e.g. Privacy Policy'}
                />
              </div>
            </Col>

            <Col md={12}>
              <div className="mb-3">
                <label htmlFor="shortDesc" className="form-label">
                  Short Description
                  <span className="text-danger ms-1">*</span>
                </label>

                <textarea
                  id="shortDesc"
                  rows={4}
                  className={`form-control ${invalid('shortDesc') ? 'is-invalid' : ''}`}
                  dir={isRtl ? 'rtl' : 'ltr'}
                  value={formData.shortDesc[activeLang]}
                  onChange={(e) => handleChange('shortDesc', e.target.value)}
                  placeholder={isRtl ? 'أدخل وصفًا قصيرًا...' : 'Enter short description...'}
                />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle as="h4" className="mb-0">
            Privacy Policy Content ({activeLang === 'en' ? 'English' : 'Arabic'})
          </CardTitle>
        </CardHeader>

        <CardBody>
          <div className={`mb-3 privacy-editor ${isRtl ? 'is-rtl' : ''} ${invalid('content') ? 'is-invalid-editor' : ''}`}>
            <label className="form-label">
              Content
              <span className="text-danger ms-1">*</span>
            </label>

            {/* key remounts the editor on tab change so undo history doesn't leak between languages */}
            <ReactQuill
              key={activeLang}
              theme="snow"
              value={formData.content[activeLang]}
              onChange={(value: string) => handleChange('content', value)}
              placeholder={isRtl ? 'أدخل محتوى سياسة الخصوصية...' : 'Enter Privacy Policy content...'}
            />
          </div>
        </CardBody>
      </Card>

      <button type="submit" className="btn btn-primary w-100 mb-4" disabled={isSaving}>
        {buttonLabel}
      </button>
    </form>
  )
}

export default PrivacyPolicy