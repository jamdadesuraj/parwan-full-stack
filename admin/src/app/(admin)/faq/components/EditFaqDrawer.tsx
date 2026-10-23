'use client'

import React, { useEffect, useState } from 'react'

import IconifyIcon from '@/components/wrappers/IconifyIcon'

import { toast } from 'react-toastify'
import { Col, Row } from 'react-bootstrap'

import { useGetFaqByIdQuery, useUpdateFaqMutation } from '@/store/faqApi'
import { FaqFormFields, LANGS, emptyFaqForm, toFaqForm, isFaqLangIncomplete, type FaqField, type FaqFormState, type Lang } from './AddFaqDrawer'

const EditFaqDrawer = ({ item }: any) => {
  const [open, setOpen] = useState(false)

  // ============================================
  // FORM
  // ============================================

  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [form, setForm] = useState<FaqFormState>(emptyFaqForm)
  const [activeLang, setActiveLang] = useState<Lang>('en')
  const [submitted, setSubmitted] = useState(false)

  // ============================================
  // API
  // ============================================

  const { data: faqResponse, isLoading } = useGetFaqByIdQuery(item?._id, {
    skip: !item?._id,
  })

  const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation()

  // ============================================
  // NORMALIZE API RESPONSE
  // ============================================

  const faqData = (faqResponse as any)?.data || faqResponse

  // ============================================
  // LOAD EXISTING DATA
  // ============================================

  useEffect(() => {
    if (!faqData) return

    // handles both old string values and new { en, ar } values
    setForm(toFaqForm(faqData))

    setStatus(faqData.status === 'inactive' ? 'inactive' : 'active')
  }, [faqData])

  // ============================================
  // CHANGE
  // ============================================

  const handleChange = (field: FaqField, lang: Lang, value: string) => {
    setForm((prev) => ({ ...prev, [field]: { ...prev[field], [lang]: value } }))
  }

  const handleStatusToggle = () => {
    setStatus((prev) => (prev === 'active' ? 'inactive' : 'active'))
  }

  // ============================================
  // OPEN / CLOSE
  // ============================================

  const handleOpen = () => {
    setActiveLang('en')
    setSubmitted(false)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setSubmitted(false)
  }

  // ============================================
  // VALIDATION + SUBMIT
  // ============================================

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
      await updateFaq({
        id: item._id,

        data: {
          question: { en: form.question.en.trim(), ar: form.question.ar.trim() },

          answer: { en: form.answer.en.trim(), ar: form.answer.ar.trim() },

          status,
        },
      }).unwrap()

      toast.success('FAQ updated successfully')

      handleClose()
    } catch (error: any) {
      console.error(error)

      toast.error(error?.data?.message || 'Failed to update FAQ')
    }
  }

  return (
    <>
      {/* OPEN BUTTON */}

      <button type="button" className="btn btn-soft-dark btn-sm d-flex align-items-center gap-2" onClick={handleOpen}>
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
          <h5 className="mb-0 fw-bold">Edit FAQ</h5>

          <button
            type="button"
            aria-label="Close"
            className="btn btn-sm btn-danger rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: 32,
              height: 32,
            }}
            onClick={handleClose}>
            ✕
          </button>
        </div>

        {/* LOADING */}

        {isLoading ? (
          <div className="p-5 text-center">
            <div className="spinner-border text-primary" />

            <div className="mt-2">Loading...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-3">
              <Row>
                {/* ENGLISH / ARABIC TABS: QUESTION + ANSWER */}

                <Col md={12}>
                  <FaqFormFields
                    form={form}
                    onChange={handleChange}
                    activeLang={activeLang}
                    onLangChange={setActiveLang}
                    submitted={submitted}
                  />
                </Col>

           
              </Row>
            </div>

            {/* FOOTER */}

            <div className="p-3 border-top d-flex gap-2">
              <button type="button" className="btn btn-light w-100" onClick={handleClose} disabled={isUpdating}>
                Cancel
              </button>

              <button type="submit" className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <span className="spinner-border spinner-border-sm" />
                    Updating...
                  </>
                ) : (
                  <>
                    <IconifyIcon icon="solar:diskette-broken" />
                    Update
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}

export default EditFaqDrawer