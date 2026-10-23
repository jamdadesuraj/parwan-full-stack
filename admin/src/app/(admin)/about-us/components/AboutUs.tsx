'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Col, Nav, Row, Tab } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { useCreateAboutUsMutation, useGetAboutUsQuery, useUpdateAboutUsMutation } from '@/store/aboutUsApi'
import type { ILocalizedText } from '@/store/aboutUsApi'

type Lang = 'en' | 'ar'

// keys must match the backend schema exactly (including its spelling)
type TextKey =
  | 'title'
  | 'subTitle'
  | 'highlightsTitle'
  | 'shortDesc'
  | 'missionTitle'
  | 'missionSubTitle'
  | 'mission'
  | 'vision'
  | 'whoWeAreTitle'
  | 'whoWeAresubTitle'
  | 'whoWeAreHightlightTitle'
  | 'whoWeAreDesc'

type FieldConfig = { name: TextKey; label: string; area?: boolean; optional?: boolean }

type HighlightForm = { icon: string; title: ILocalizedText; desc: ILocalizedText }

type FormState = {
  texts: Record<TextKey, ILocalizedText>
  highlights: HighlightForm[]
  values: ILocalizedText[]
}

const LANGS: { lang: Lang; label: string }[] = [
  { lang: 'en', label: 'English' },
  { lang: 'ar', label: 'Arabic' },
]

const MIN_LENGTH = 2

const MAIN_FIELDS: FieldConfig[] = [
  { name: 'title', label: 'Title' },
  { name: 'subTitle', label: 'Sub-Title' },
  { name: 'highlightsTitle', label: 'Highlights Title' },
  { name: 'shortDesc', label: 'Short Description', area: true },
]

const MISSION_FIELDS: FieldConfig[] = [
  { name: 'missionTitle', label: 'Mission Title' },
  { name: 'missionSubTitle', label: 'Mission Sub-Title' },
  { name: 'mission', label: 'Mission', area: true },
  { name: 'vision', label: 'Vision', area: true },
]

const WHO_FIELDS: FieldConfig[] = [
  { name: 'whoWeAreTitle', label: 'Who We Are – Title', optional: true },
  { name: 'whoWeAresubTitle', label: 'Who We Are – Sub-Title', optional: true },
  { name: 'whoWeAreHightlightTitle', label: 'Who We Are – Highlight Title', optional: true },
  { name: 'whoWeAreDesc', label: 'Who We Are – Description', area: true, optional: true },
]

const ALL_FIELDS = [...MAIN_FIELDS, ...MISSION_FIELDS, ...WHO_FIELDS]

const emptyText = (): ILocalizedText => ({ en: '', ar: '' })
const toText = (t?: ILocalizedText): ILocalizedText => ({ en: t?.en ?? '', ar: t?.ar ?? '' })

const emptyForm = (): FormState => ({
  texts: ALL_FIELDS.reduce((acc, f) => {
    acc[f.name] = emptyText()
    return acc
  }, {} as Record<TextKey, ILocalizedText>),
  highlights: [],
  values: [],
})

const tooShort = (v: string) => v.trim().length < MIN_LENGTH

// optional fields may stay empty, but if one language is filled the other must be too
const isFieldBad = (value: ILocalizedText, lang: Lang, optional?: boolean) => {
  if (optional && !value.en.trim() && !value.ar.trim()) return false
  return tooShort(value[lang])
}

const isLangIncomplete = (form: FormState, lang: Lang) =>
  ALL_FIELDS.some((f) => isFieldBad(form.texts[f.name], lang, f.optional)) ||
  form.highlights.some((h) => tooShort(h.title[lang]) || tooShort(h.desc[lang])) ||
  form.values.some((v) => tooShort(v[lang]))

// ============================================
// IMAGE INPUT (preview of saved image or newly picked file)
// ============================================

const ImageInput = ({ label, existingUrl, onFile }: { label: string; existingUrl?: string; onFile: (file: File | null) => void }) => {
  const [preview, setPreview] = useState(existingUrl || '')

  useEffect(() => {
    return () => {
      if (preview.startsWith('blob:')) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      e.target.value = ''
      return
    }

    onFile(file)
    setPreview(URL.createObjectURL(file))
  }

  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <input type="file" accept="image/*" className="form-control" onChange={handleFile} />
      {preview && (
        <div className="border rounded p-2 bg-light mt-2" style={{ maxWidth: 320 }}>
          {/* plain <img>: works with blob: URLs and any Cloudinary domain */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={label} style={{ width: '100%', height: 160, objectFit: 'contain' }} />
        </div>
      )}
    </div>
  )
}

// ============================================
// PAGE
// ============================================

const AboutUs = () => {
  const { data: list, isLoading } = useGetAboutUsQuery()
  const [createAboutUs, { isLoading: creating }] = useCreateAboutUsMutation()
  const [updateAboutUs, { isLoading: updating }] = useUpdateAboutUsMutation()

  // single document: use the first one if it exists
  const item = list?.[0]

  const [activeLang, setActiveLang] = useState<Lang>('en')
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [img1File, setImg1File] = useState<File | null>(null)
  const [img2File, setImg2File] = useState<File | null>(null)

  // ============================================
  // LOAD EXISTING DATA
  // ============================================

  useEffect(() => {
    if (!item) return

    setForm({
      texts: ALL_FIELDS.reduce((acc, f) => {
        acc[f.name] = toText(item[f.name])
        return acc
      }, {} as Record<TextKey, ILocalizedText>),
      highlights: (item.highlights ?? []).map((h) => ({
        icon: h.icon ?? '',
        title: toText(h.title),
        desc: toText(h.desc),
      })),
      values: (item.values ?? []).map(toText),
    })
    setImg1File(null)
    setImg2File(null)
  }, [item])

  // ============================================
  // HANDLERS
  // ============================================

  const setText = (name: TextKey, lang: Lang, value: string) => {
    setForm((prev) => ({
      ...prev,
      texts: { ...prev.texts, [name]: { ...prev.texts[name], [lang]: value } },
    }))
  }

  const addHighlight = () => setForm((prev) => ({ ...prev, highlights: [...prev.highlights, { icon: '', title: emptyText(), desc: emptyText() }] }))
  const removeHighlight = (i: number) => setForm((prev) => ({ ...prev, highlights: prev.highlights.filter((_, idx) => idx !== i) }))
  const setHighlightIcon = (i: number, value: string) =>
    setForm((prev) => ({ ...prev, highlights: prev.highlights.map((h, idx) => (idx === i ? { ...h, icon: value } : h)) }))
  const setHighlightText = (i: number, field: 'title' | 'desc', lang: Lang, value: string) =>
    setForm((prev) => ({
      ...prev,
      highlights: prev.highlights.map((h, idx) => (idx === i ? { ...h, [field]: { ...h[field], [lang]: value } } : h)),
    }))

  const addValue = () => setForm((prev) => ({ ...prev, values: [...prev.values, emptyText()] }))
  const removeValue = (i: number) => setForm((prev) => ({ ...prev, values: prev.values.filter((_, idx) => idx !== i) }))
  const setValueText = (i: number, lang: Lang, value: string) =>
    setForm((prev) => ({ ...prev, values: prev.values.map((v, idx) => (idx === i ? { ...v, [lang]: value } : v)) }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)

    // manual validation (native `required` can't focus inputs inside a hidden tab)
    const badLang = LANGS.find(({ lang }) => isLangIncomplete(form, lang))
    if (badLang) {
      setActiveLang(badLang.lang)
      toast.error(`Please complete all required fields in the ${badLang.label} tab (min ${MIN_LENGTH} characters)`)
      return
    }

    try {
      const data = new FormData()

      ALL_FIELDS.forEach(({ name, optional }) => {
        const value = form.texts[name]
        if (optional && !value.en.trim() && !value.ar.trim()) return // leave optional field out
        data.append(`${name}[en]`, value.en.trim())
        data.append(`${name}[ar]`, value.ar.trim())
      })

      form.highlights.forEach((h, i) => {
        data.append(`highlights[${i}][icon]`, h.icon.trim())
        data.append(`highlights[${i}][title][en]`, h.title.en.trim())
        data.append(`highlights[${i}][title][ar]`, h.title.ar.trim())
        data.append(`highlights[${i}][desc][en]`, h.desc.en.trim())
        data.append(`highlights[${i}][desc][ar]`, h.desc.ar.trim())
      })

      form.values.forEach((v, i) => {
        data.append(`values[${i}][en]`, v.en.trim())
        data.append(`values[${i}][ar]`, v.ar.trim())
      })

      if (img1File) data.append('img1', img1File)
      if (img2File) data.append('img2', img2File)

      if (item) {
        await updateAboutUs({ id: item._id, data }).unwrap()
        toast.success('About Us updated successfully')
      } else {
        await createAboutUs(data).unwrap()
        toast.success('About Us created successfully')
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

  const renderField = ({ name, label, area, optional }: FieldConfig, lang: Lang, langLabel: string) => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr'
    const common = {
      dir,
      className: 'form-control',
      value: form.texts[name][lang],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setText(name, lang, e.target.value),
    }

    return (
      <Col md={area ? 12 : 6} key={name}>
        <div className="mb-3">
          <label className="form-label">
            {label} ({langLabel}){optional ? '' : '*'}
          </label>
          {area ? <textarea rows={4} {...common} /> : <input type="text" {...common} />}
        </div>
      </Col>
    )
  }

  const renderLangPane = (lang: Lang, langLabel: string) => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr'

    return (
      <Tab.Pane eventKey={lang} key={lang}>
        {/* MAIN */}
        <Row>{MAIN_FIELDS.map((f) => renderField(f, lang, langLabel))}</Row>

        {/* HIGHLIGHTS */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">Highlights</h5>
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={addHighlight}>
            + Add highlight
          </button>
        </div>
        {form.highlights.length === 0 && <p className="text-muted">No highlights added yet.</p>}
        {form.highlights.map((h, i) => (
          <div key={i} className="border rounded p-3 mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>Highlight {i + 1}</strong>
              <button type="button" className="btn btn-sm btn-soft-danger" onClick={() => removeHighlight(i)}>
                Remove
              </button>
            </div>
            <Row>
              <Col md={4}>
                <div className="mb-3">
                  <label className="form-label">Icon (same for both languages)</label>
                  <input type="text" className="form-control" placeholder="e.g. solar:star-broken" value={h.icon} onChange={(e) => setHighlightIcon(i, e.target.value)} />
                </div>
              </Col>
              <Col md={8}>
                <div className="mb-3">
                  <label className="form-label">Title ({langLabel})*</label>
                  <input type="text" dir={dir} className="form-control" value={h.title[lang]} onChange={(e) => setHighlightText(i, 'title', lang, e.target.value)} />
                </div>
              </Col>
              <Col md={12}>
                <label className="form-label">Description ({langLabel})*</label>
                <textarea rows={2} dir={dir} className="form-control" value={h.desc[lang]} onChange={(e) => setHighlightText(i, 'desc', lang, e.target.value)} />
              </Col>
            </Row>
          </div>
        ))}

        {/* MISSION & VISION */}
        <h5 className="mt-4">Mission &amp; Vision</h5>
        <Row>{MISSION_FIELDS.map((f) => renderField(f, lang, langLabel))}</Row>

        {/* VALUES */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">Values</h5>
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={addValue}>
            + Add value
          </button>
        </div>
        {form.values.length === 0 && <p className="text-muted">No values added yet.</p>}
        {form.values.map((v, i) => (
          <div key={i} className="d-flex gap-2 align-items-start mb-2">
            <div className="flex-grow-1">
              <input
                type="text"
                dir={dir}
                className="form-control"
                placeholder={`Value ${i + 1} (${langLabel})*`}
                value={v[lang]}
                onChange={(e) => setValueText(i, lang, e.target.value)}
              />
            </div>
            <button type="button" className="btn btn-soft-danger" onClick={() => removeValue(i)}>
              Remove
            </button>
          </div>
        ))}

        {/* WHO WE ARE (optional) */}
        <h5 className="mt-4">Who We Are (optional)</h5>
        <Row>{WHO_FIELDS.map((f) => renderField(f, lang, langLabel))}</Row>
      </Tab.Pane>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle as="h4">About Us</CardTitle>
        </CardHeader>

        <CardBody>
          {/* IMAGES (shared by both languages); key remounts them after each save */}
          <Row key={`${item?._id}-${item?.updatedAt}`}>
            <Col md={6}>
              <ImageInput label="Image 1" existingUrl={item?.img1} onFile={setImg1File} />
            </Col>
            <Col md={6}>
              <ImageInput label="Image 2" existingUrl={item?.img2} onFile={setImg2File} />
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

export default AboutUs