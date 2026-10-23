'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Col, Nav, Row, Tab } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { useCreateWhyChooseUsMutation, useGetWhyChooseUsQuery, useUpdateWhyChooseUsMutation } from '@/store/whyChooseUsApi'
import type { ILocalizedText } from '@/store/whyChooseUsApi'

type Lang = 'en' | 'ar'
type TextField = 'title' | 'subTitle' | 'desc'

type FeatureForm = {
  icon: string
  title: ILocalizedText
  desc: ILocalizedText
}

type FormState = {
  title: ILocalizedText
  subTitle: ILocalizedText
  desc: ILocalizedText
  features: FeatureForm[]
}

const LANGS: { lang: Lang; label: string }[] = [
  { lang: 'en', label: 'English' },
  { lang: 'ar', label: 'العربية (Arabic)' },
]

const MIN_LENGTH = 2

const emptyText = (): ILocalizedText => ({ en: '', ar: '' })
const emptyFeature = (): FeatureForm => ({ icon: '', title: emptyText(), desc: emptyText() })
const emptyForm = (): FormState => ({
  title: emptyText(),
  subTitle: emptyText(),
  desc: emptyText(),
  features: [],
})

// true when something required for this language is missing / too short
const isLangIncomplete = (form: FormState, lang: Lang) => {
  const bad = (v: string) => v.trim().length < MIN_LENGTH
  return (
    bad(form.title[lang]) || bad(form.subTitle[lang]) || bad(form.desc[lang]) || form.features.some((f) => bad(f.title[lang]) || bad(f.desc[lang]))
  )
}

const WhyUs = () => {
  const { data: list, isLoading } = useGetWhyChooseUsQuery()
  const [createWhyChooseUs, { isLoading: creating }] = useCreateWhyChooseUsMutation()
  const [updateWhyChooseUs, { isLoading: updating }] = useUpdateWhyChooseUsMutation()

  // single document: use the first one if it exists
  const item = list?.[0]

  const [activeLang, setActiveLang] = useState<Lang>('en')
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ============================================
  // LOAD EXISTING DATA
  // ============================================

  useEffect(() => {
    if (!item) return

    setForm({
      title: { en: item.title?.en ?? '', ar: item.title?.ar ?? '' },
      subTitle: { en: item.subTitle?.en ?? '', ar: item.subTitle?.ar ?? '' },
      desc: { en: item.desc?.en ?? '', ar: item.desc?.ar ?? '' },
      features: (item.features ?? []).map((f) => ({
        icon: f.icon ?? '',
        title: { en: f.title?.en ?? '', ar: f.title?.ar ?? '' },
        desc: { en: f.desc?.en ?? '', ar: f.desc?.ar ?? '' },
      })),
    })
    setImageFile(null)
    setPreview(item.image || '')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [item])

  // revoke blob URLs when the preview changes / on unmount
  useEffect(() => {
    return () => {
      if (preview.startsWith('blob:')) URL.revokeObjectURL(preview)
    }
  }, [preview])

  // ============================================
  // HANDLERS
  // ============================================

  const setText = (field: TextField, lang: Lang, value: string) => {
    setForm((prev) => ({ ...prev, [field]: { ...prev[field], [lang]: value } }))
  }

  const addFeature = () => {
    setForm((prev) => ({ ...prev, features: [...prev.features, emptyFeature()] }))
  }

  const removeFeature = (index: number) => {
    setForm((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }))
  }

  const setFeatureIcon = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? { ...f, icon: value } : f)),
    }))
  }

  const setFeatureText = (index: number, field: 'title' | 'desc', lang: Lang, value: string) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? { ...f, [field]: { ...f[field], [lang]: value } } : f)),
    }))
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      e.target.value = ''
      return
    }

    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)

    // manual validation (native `required` can't focus inputs inside a hidden tab)
    const badLang = LANGS.find(({ lang }) => isLangIncomplete(form, lang))
    if (badLang) {
      setActiveLang(badLang.lang)
      toast.error(`Please complete all fields in the ${badLang.label} tab (min ${MIN_LENGTH} characters)`)
      return
    }

    try {
      const data = new FormData()

      ;(['title', 'subTitle', 'desc'] as TextField[]).forEach((field) => {
        data.append(`${field}[en]`, form[field].en.trim())
        data.append(`${field}[ar]`, form[field].ar.trim())
      })

      form.features.forEach((f, i) => {
        data.append(`features[${i}][icon]`, f.icon.trim())
        data.append(`features[${i}][title][en]`, f.title.en.trim())
        data.append(`features[${i}][title][ar]`, f.title.ar.trim())
        data.append(`features[${i}][desc][en]`, f.desc.en.trim())
        data.append(`features[${i}][desc][ar]`, f.desc.ar.trim())
      })

      if (imageFile) data.append('image', imageFile)

      if (item) {
        await updateWhyChooseUs({ id: item._id, data }).unwrap()
        toast.success('Why Choose Us updated successfully')
      } else {
        await createWhyChooseUs(data).unwrap()
        toast.success('Why Choose Us created successfully')
      }

      setSubmitted(false)
      // list refetches automatically (tags) and the effect above re-syncs the form
    } catch (error: any) {
      toast.error(error?.data?.message || 'Something went wrong')
    }
  }

  // ============================================
  // RENDER
  // ============================================

  if (isLoading) return <div>Loading...</div>

  const busy = creating || updating

  const renderLangPane = (lang: Lang, label: string) => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr'

    return (
      <Tab.Pane eventKey={lang} key={lang}>
        <Row>
          <Col md={6}>
            <div className="mb-3">
              <label className="form-label">Title ({label})*</label>
              <input
                type="text"
                dir={dir}
                className="form-control"
                value={form.title[lang]}
                onChange={(e) => setText('title', lang, e.target.value)}
              />
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-3">
              <label className="form-label">Sub-Title ({label})*</label>
              <input
                type="text"
                dir={dir}
                className="form-control"
                value={form.subTitle[lang]}
                onChange={(e) => setText('subTitle', lang, e.target.value)}
              />
            </div>
          </Col>
          <Col md={12}>
            <div className="mb-3">
              <label className="form-label">Description ({label})*</label>
              <textarea rows={4} dir={dir} className="form-control" value={form.desc[lang]} onChange={(e) => setText('desc', lang, e.target.value)} />
            </div>
          </Col>
        </Row>

        {/* FEATURES */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">Features</h5>
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={addFeature}>
            + Add feature
          </button>
        </div>

        {form.features.length === 0 && <p className="text-muted">No features added yet.</p>}

        {form.features.map((feature, index) => (
          <div key={index} className="border rounded p-3 mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>Feature {index + 1}</strong>
              <button type="button" className="btn btn-sm btn-soft-danger" onClick={() => removeFeature(index)}>
                Remove
              </button>
            </div>

            <Row>
              <Col md={4}>
                <div className="mb-3">
                  <label className="form-label">Icon (same for both languages)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. solar:shield-check-broken"
                    value={feature.icon}
                    onChange={(e) => setFeatureIcon(index, e.target.value)}
                  />
                </div>
              </Col>
              <Col md={8}>
                <div className="mb-3">
                  <label className="form-label">Feature title ({label})*</label>
                  <input
                    type="text"
                    dir={dir}
                    className="form-control"
                    value={feature.title[lang]}
                    onChange={(e) => setFeatureText(index, 'title', lang, e.target.value)}
                  />
                </div>
              </Col>
              <Col md={12}>
                <div className="mb-0">
                  <label className="form-label">Feature description ({label})*</label>
                  <textarea
                    rows={2}
                    dir={dir}
                    className="form-control"
                    value={feature.desc[lang]}
                    onChange={(e) => setFeatureText(index, 'desc', lang, e.target.value)}
                  />
                </div>
              </Col>
            </Row>
          </div>
        ))}
      </Tab.Pane>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle as="h4">Why Choose Us</CardTitle>
        </CardHeader>

        <CardBody>
          {/* IMAGE (shared by both languages) */}
          <Row className="mb-3">
            <Col md={12}>
              <label className="form-label">Image</label>
              <input ref={fileInputRef} type="file" accept="image/*" className="form-control" onChange={handleFile} />
              {preview && (
                <div className="border rounded p-2 bg-light mt-2" style={{ maxWidth: 320 }}>
                  {/* plain <img>: works with blob: URLs and any Cloudinary domain */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Why choose us" style={{ width: '100%', height: 180, objectFit: 'contain' }} />
                </div>
              )}
            </Col>
          </Row>

          {/* LANGUAGE TABS */}
          <Tab.Container activeKey={activeLang} onSelect={(k) => k && setActiveLang(k as Lang)}>
            <Nav variant="tabs" className="mb-3">
              {LANGS.map(({ lang, label }) => (
                <Nav.Item key={lang}>
                  <Nav.Link eventKey={lang} className="d-flex align-items-center gap-2">
                    {label}
                    {submitted && isLangIncomplete(form, lang) && <span className="badge bg-danger">!</span>}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>

            <Tab.Content>{LANGS.map(({ lang, label }) => renderLangPane(lang, label))}</Tab.Content>
          </Tab.Container>

          <button type="submit" className="btn btn-primary w-100 mt-3" disabled={busy}>
            {busy ? 'Please wait...' : item?._id ? 'Update' : 'Create'}
          </button>
        </CardBody>
      </Card>
    </form>
  )
}

export default WhyUs
