'use client'

import React, { useEffect, useMemo, useState } from 'react'

import dynamic from 'next/dynamic'

import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'

import { toast } from 'react-toastify'

import { useCreateTermsMutation, useGetTermsQuery, useUpdateTermsMutation, type ILocalizedText } from '@/store/termsApi'

// @ts-ignore
import 'react-quill-new/dist/quill.snow.css'

// Quill touches `document`, so it must only render on the client.
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

// ---------- types ----------
type Lang = 'en' | 'ar'
type Field = 'title' | 'subTitle' | 'shortDesc' | 'content'

type TermsFormData = Record<Field, ILocalizedText>

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
const emptyForm = (): TermsFormData => ({
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

const isLangIncomplete = (form: TermsFormData, lang: Lang) => FIELDS.some((field) => isFieldEmpty(field, form[field][lang]))

// ---------- component ----------
const Terms = () => {
  const { data: termsResponse, isLoading, isError, error, refetch } = useGetTermsQuery()

  const [createTerms, { isLoading: creating }] = useCreateTermsMutation()
  const [updateTerms, { isLoading: updating }] = useUpdateTermsMutation()

  const [formData, setFormData] = useState<TermsFormData>(emptyForm)
  const [activeLang, setActiveLang] = useState<Lang>('en')
  const [submitted, setSubmitted] = useState(false)

  const terms = useMemo(() => normalizeResponse(termsResponse), [termsResponse])

  // A 404 just means nothing has been created yet, so the empty form should still show.
  const notFound = isError && (error as any)?.status === 404

  const isSaving = creating || updating
  const isRtl = activeLang === 'ar'

  useEffect(() => {
    if (!terms) return

    setFormData({
      title: toLocalized(terms.title),
      // falls back to the old badgeTitle field for legacy data
      subTitle: toLocalized(terms.subTitle ?? terms.badgeTitle),
      shortDesc: toLocalized(terms.shortDesc),
      content: toLocalized(terms.content),
    })
  }, [terms])

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
      if (terms?._id) {
        await updateTerms({ _id: terms._id, ...payload }).unwrap()
        toast.success('Terms & Conditions updated successfully')
      } else {
        await createTerms(payload).unwrap()
        toast.success('Terms & Conditions created successfully')
      }

      setSubmitted(false)
      await refetch()
    } catch (err: any) {
      console.error('Terms & Conditions error:', err)
      toast.error(err?.data?.message || 'Something went wrong')
    }
  }

  if (isLoading) {
    return (
      <div className="py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <div className="mt-2">Loading Terms & Conditions...</div>
      </div>
    )
  }

  if (isError && !notFound) {
    return <div className="alert alert-danger">Unable to load Terms & Conditions.</div>
  }

  const buttonLabel = isSaving ? (terms?._id ? 'Updating...' : 'Creating...') : terms?._id ? 'Update Terms & Conditions' : 'Create Terms & Conditions'

  return (
    <form onSubmit={handleSubmit}>
      <style>{`
        .terms-editor .ql-editor { min-height: 300px; }
        .terms-editor.is-rtl .ql-editor { direction: rtl; text-align: right; }
        .terms-editor.is-invalid-editor .ql-toolbar,
        .terms-editor.is-invalid-editor .ql-container { border-color: var(--bs-danger, #dc3545); }
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
            Terms & Conditions ({activeLang === 'en' ? 'English' : 'Arabic'})
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
                  placeholder={isRtl ? 'مثال: قانوني' : 'e.g. Legal'}
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
                  placeholder={isRtl ? 'مثال: الشروط والأحكام' : 'e.g. Terms & Conditions'}
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
            Terms & Conditions Content ({activeLang === 'en' ? 'English' : 'Arabic'})
          </CardTitle>
        </CardHeader>

        <CardBody>
          <div className={`mb-3 terms-editor ${isRtl ? 'is-rtl' : ''} ${invalid('content') ? 'is-invalid-editor' : ''}`}>
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
              placeholder={isRtl ? 'أدخل محتوى الشروط والأحكام...' : 'Enter Terms & Conditions content...'}
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

export default Terms