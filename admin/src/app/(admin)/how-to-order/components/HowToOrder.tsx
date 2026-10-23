'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Col, Nav, Row, Tab } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { useCreateHowToOrderMutation, useGetHowToOrderQuery, useUpdateHowToOrderMutation } from '@/store/howToOrderApi'
import type { ILocalizedText, IHowToOrderPayload } from '@/store/howToOrderApi'

type Lang = 'en' | 'ar'
type TextField = 'title' | 'subTitle' | 'shortDesc'

type StepForm = {
  icon: string
  title: ILocalizedText
  desc: ILocalizedText
}

type FormState = {
  title: ILocalizedText
  subTitle: ILocalizedText
  shortDesc: ILocalizedText
  steps: StepForm[]
}

const LANGS: { lang: Lang; label: string }[] = [
  { lang: 'en', label: 'English' },
  { lang: 'ar', label: 'Arabic' },
]

const MIN_LENGTH = 2

const emptyText = (): ILocalizedText => ({ en: '', ar: '' })
const emptyStep = (): StepForm => ({ icon: '', title: emptyText(), desc: emptyText() })
const emptyForm = (): FormState => ({
  title: emptyText(),
  subTitle: emptyText(),
  shortDesc: emptyText(),
  steps: [],
})

// true when something required for this language is missing / too short
const isLangIncomplete = (form: FormState, lang: Lang) => {
  const bad = (v: string) => v.trim().length < MIN_LENGTH
  return (
    bad(form.title[lang]) || bad(form.subTitle[lang]) || bad(form.shortDesc[lang]) || form.steps.some((s) => bad(s.title[lang]) || bad(s.desc[lang]))
  )
}

const HowToOrder = () => {
  const { data: list, isLoading } = useGetHowToOrderQuery()
  const [createHowToOrder, { isLoading: creating }] = useCreateHowToOrderMutation()
  const [updateHowToOrder, { isLoading: updating }] = useUpdateHowToOrderMutation()

  // single document: use the first one if it exists
  const item = list?.[0]

  const [activeLang, setActiveLang] = useState<Lang>('en')
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)

  // ============================================
  // LOAD EXISTING DATA
  // ============================================

  useEffect(() => {
    if (!item) return

    setForm({
      title: { en: item.title?.en ?? '', ar: item.title?.ar ?? '' },
      subTitle: { en: item.subTitle?.en ?? '', ar: item.subTitle?.ar ?? '' },
      shortDesc: { en: item.shortDesc?.en ?? '', ar: item.shortDesc?.ar ?? '' },
      steps: (item.steps ?? []).map((s) => ({
        icon: s.icon ?? '',
        title: { en: s.title?.en ?? '', ar: s.title?.ar ?? '' },
        desc: { en: s.desc?.en ?? '', ar: s.desc?.ar ?? '' },
      })),
    })
  }, [item])

  // ============================================
  // HANDLERS
  // ============================================

  const setText = (field: TextField, lang: Lang, value: string) => {
    setForm((prev) => ({ ...prev, [field]: { ...prev[field], [lang]: value } }))
  }

  const addStep = () => {
    setForm((prev) => ({ ...prev, steps: [...prev.steps, emptyStep()] }))
  }

  const removeStep = (index: number) => {
    setForm((prev) => ({ ...prev, steps: prev.steps.filter((_, i) => i !== index) }))
  }

  const setStepIcon = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      steps: prev.steps.map((s, i) => (i === index ? { ...s, icon: value } : s)),
    }))
  }

  const setStepText = (index: number, field: 'title' | 'desc', lang: Lang, value: string) => {
    setForm((prev) => ({
      ...prev,
      steps: prev.steps.map((s, i) => (i === index ? { ...s, [field]: { ...s[field], [lang]: value } } : s)),
    }))
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
      // JSON body: this route has no file upload, so multipart/FormData
      // would never be parsed by the server (req.body stays undefined)
      const data: IHowToOrderPayload = {
        title: { en: form.title.en.trim(), ar: form.title.ar.trim() },
        subTitle: { en: form.subTitle.en.trim(), ar: form.subTitle.ar.trim() },
        shortDesc: { en: form.shortDesc.en.trim(), ar: form.shortDesc.ar.trim() },
        steps: form.steps.map((s) => ({
          icon: s.icon.trim(),
          title: { en: s.title.en.trim(), ar: s.title.ar.trim() },
          desc: { en: s.desc.en.trim(), ar: s.desc.ar.trim() },
        })),
      }

      if (item) {
        await updateHowToOrder({ id: item._id, data }).unwrap()
        toast.success('How To Order updated successfully')
      } else {
        await createHowToOrder(data).unwrap()
        toast.success('How To Order created successfully')
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
              <label className="form-label">Short Description ({label})*</label>
              <textarea
                rows={4}
                dir={dir}
                className="form-control"
                value={form.shortDesc[lang]}
                onChange={(e) => setText('shortDesc', lang, e.target.value)}
              />
            </div>
          </Col>
        </Row>

        {/* STEPS */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">Steps</h5>
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={addStep}>
            + Add step
          </button>
        </div>

        {form.steps.length === 0 && <p className="text-muted">No steps added yet.</p>}

        {form.steps.map((step, index) => (
          <div key={index} className="border rounded p-3 mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>Step {index + 1}</strong>
              <button type="button" className="btn btn-sm btn-soft-danger" onClick={() => removeStep(index)}>
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
                    placeholder="e.g. solar:cart-large-2-broken"
                    value={step.icon}
                    onChange={(e) => setStepIcon(index, e.target.value)}
                  />
                </div>
              </Col>
              <Col md={8}>
                <div className="mb-3">
                  <label className="form-label">Step title ({label})*</label>
                  <input
                    type="text"
                    dir={dir}
                    className="form-control"
                    value={step.title[lang]}
                    onChange={(e) => setStepText(index, 'title', lang, e.target.value)}
                  />
                </div>
              </Col>
              <Col md={12}>
                <div className="mb-0">
                  <label className="form-label">Step description ({label})*</label>
                  <textarea
                    rows={2}
                    dir={dir}
                    className="form-control"
                    value={step.desc[lang]}
                    onChange={(e) => setStepText(index, 'desc', lang, e.target.value)}
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
          <CardTitle as="h4">How To Order</CardTitle>
        </CardHeader>

        <CardBody>
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

export default HowToOrder
