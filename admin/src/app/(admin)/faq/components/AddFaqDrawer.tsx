'use client'

import React, { useState } from 'react'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { toast } from 'react-toastify'
import { ILocalizedText, useCreateFaqMutation } from '@/store/faqApi'

// ---------- types ----------
export type Lang = 'en' | 'ar'
export type FaqField = 'question' | 'answer'

export type FaqFormState = {
  question: ILocalizedText
  answer: ILocalizedText
}

// ---------- constants ----------
export const LANGS: { lang: Lang; label: string }[] = [
  { lang: 'en', label: 'English' },
  { lang: 'ar', label: 'Arabic' },
]

// ---------- helpers ----------
export const emptyFaqForm = (): FaqFormState => ({
  question: { en: '', ar: '' },
  answer: { en: '', ar: '' },
})

const toLocalized = (value: unknown): ILocalizedText => {
  if (typeof value === 'string') return { en: value, ar: '' }
  const v = (value ?? {}) as Partial<ILocalizedText>
  return { en: v.en ?? '', ar: v.ar ?? '' }
}

// Converts an API item into a safe form state (used by the Edit drawer)
export const toFaqForm = (faq?: { question?: unknown; answer?: unknown } | null): FaqFormState =>
  faq ? { question: toLocalized(faq.question), answer: toLocalized(faq.answer) } : emptyFaqForm()

export const isFaqLangIncomplete = (form: FaqFormState | undefined, lang: Lang) =>
  !form?.question?.[lang]?.trim() || !form?.answer?.[lang]?.trim()

// ---------- shared form fields (English / Arabic tabs) ----------
type FaqFormFieldsProps = {
  form?: FaqFormState
  onChange: (field: FaqField, lang: Lang, value: string) => void
  activeLang?: Lang
  onLangChange?: (lang: Lang) => void
  submitted: boolean
}

export const FaqFormFields = ({ form = emptyFaqForm(), onChange, activeLang, onLangChange, submitted }: FaqFormFieldsProps) => {
  // Works controlled (activeLang passed) or uncontrolled
  const [innerLang, setInnerLang] = useState<Lang>('en')
  const lang = activeLang ?? innerLang

  const selectLang = (l: Lang) => {
    setInnerLang(l)
    onLangChange?.(l)
  }

  const isRtl = lang === 'ar'
  const questionInvalid = submitted && !form.question[lang]?.trim()
  const answerInvalid = submitted && !form.answer[lang]?.trim()

  return (
    <>
      {/* LANGUAGE TABS */}
      <ul className="nav nav-tabs mb-3">
        {LANGS.map(({ lang: l, label }) => {
          const incomplete = submitted && isFaqLangIncomplete(form, l)
          return (
            <li className="nav-item" key={l}>
              <button
                type="button"
                className={`nav-link ${lang === l ? 'active' : ''} ${incomplete ? 'text-danger' : ''}`}
                onClick={() => selectLang(l)}>
                {label}
                {incomplete && <span className="ms-1">*</span>}
              </button>
            </li>
          )
        })}
      </ul>

      {/* QUESTION */}
      <div className="mb-3">
        <label className="form-label">
          Question<span className="text-danger ms-1">*</span>
        </label>
        <input
          type="text"
          className={`form-control ${questionInvalid ? 'is-invalid' : ''}`}
          dir={isRtl ? 'rtl' : 'ltr'}
          placeholder={isRtl ? 'أدخل السؤال' : 'Enter question'}
          value={form.question[lang] ?? ''}
          onChange={(e) => onChange('question', lang, e.target.value)}
        />
      </div>

      {/* ANSWER */}
      <div className="mb-3">
        <label className="form-label">
          Answer<span className="text-danger ms-1">*</span>
        </label>
        <textarea
          rows={6}
          className={`form-control ${answerInvalid ? 'is-invalid' : ''}`}
          dir={isRtl ? 'rtl' : 'ltr'}
          placeholder={isRtl ? 'أدخل الإجابة' : 'Enter answer'}
          value={form.answer[lang] ?? ''}
          onChange={(e) => onChange('answer', lang, e.target.value)}
        />
      </div>
    </>
  )
}

// ---------- drawer ----------
const AddFaqDrawer = () => {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FaqFormState>(emptyFaqForm)
  const [activeLang, setActiveLang] = useState<Lang>('en')
  const [submitted, setSubmitted] = useState(false)

  const [createFaq, { isLoading: isCreating }] = useCreateFaqMutation()

  const handleChange = (field: FaqField, lang: Lang, value: string) => {
    setForm((prev) => ({ ...prev, [field]: { ...prev[field], [lang]: value } }))
  }

  const resetForm = () => {
    setForm(emptyFaqForm())
    setActiveLang('en')
    setSubmitted(false)
  }

  const handleClose = () => {
    setOpen(false)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)

    const badLang = LANGS.find(({ lang }) => isFaqLangIncomplete(form, lang))
    if (badLang) {
      setActiveLang(badLang.lang)
      toast.error(`Question and answer are required in the ${badLang.label} tab`)
      return
    }

    try {
      await createFaq({
        question: { en: form.question.en.trim(), ar: form.question.ar.trim() },
        answer: { en: form.answer.en.trim(), ar: form.answer.ar.trim() },
      }).unwrap()

      toast.success('FAQ created successfully')
      handleClose()
    } catch (error: any) {
      console.error(error)
      toast.error(error?.data?.message || 'Something went wrong')
    }
  }

  return (
    <>
      {/* OPEN BUTTON */}
      <button type="button" className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setOpen(true)}>
        <IconifyIcon icon="solar:add-circle-broken" />
        Add FAQ
      </button>

      {/* OVERLAY */}
      {open && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1040 }}
          onClick={handleClose}
        />
      )}

      {/* DRAWER */}
      <div
        aria-hidden={!open}
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
          <h5 className="mb-0 fw-bold">Add FAQ</h5>
          <button
            type="button"
            aria-label="Close"
            className="btn btn-sm btn-danger rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: 32, height: 32 }}
            onClick={handleClose}>
            ✕
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="p-3">
            {/* ENGLISH / ARABIC TABS */}
            <FaqFormFields
              form={form}
              onChange={handleChange}
              activeLang={activeLang}
              onLangChange={setActiveLang}
              submitted={submitted}
            />
          </div>

          {/* FOOTER */}
          <div className="p-3 border-top d-flex gap-2">
            <button type="button" className="btn btn-light w-100" onClick={handleClose} disabled={isCreating}>
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
              disabled={isCreating}>
              {isCreating ? (
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

export default AddFaqDrawer