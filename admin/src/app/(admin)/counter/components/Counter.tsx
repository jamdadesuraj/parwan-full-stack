'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { useCreateCounterMutation, useGetCounterQuery, useUpdateCounterMutation } from '@/store/counterApi'
import type { CounterField, CounterPayload } from '@/store/counterApi'

type Lang = 'en' | 'ar'

const LANGS: { lang: Lang; heading: string }[] = [
  { lang: 'en', heading: 'Counter (English)' },
  { lang: 'ar', heading: 'Counter (Arabic)' },
]

// label + grid width for each field
// `name` must match the backend keys exactly
const FIELDS: { name: CounterField; label: string; md: number }[] = [
  // @ts-ignore
  { name: 'protected', label: 'Protected', md: 3 },
    // @ts-ignore
  { name: 'Nopreservatives', label: 'No preservatives', md: 3 },
    // @ts-ignore
  { name: 'Happycustomers', label: 'Happy customers', md: 3 },
    // @ts-ignore
  { name: 'Wereheretohelp', label: "We're here to help", md: 3 },
]

const EMPTY_FORM = FIELDS.reduce((acc, { name }) => {
  acc[name] = { en: '', ar: '' }
  return acc
}, {} as CounterPayload)

const Counter = () => {
  const { data: counters, isLoading } = useGetCounterQuery()
  const [createCounter, { isLoading: creating }] = useCreateCounterMutation()
  const [updateCounter, { isLoading: updating }] = useUpdateCounterMutation()

  // there is a single counter document: use the first one if it exists
  const counter = counters?.[0]

  const [formData, setFormData] = useState<CounterPayload>(EMPTY_FORM)

  // load existing data into the form
  useEffect(() => {
    if (!counter) return

    setFormData(
      FIELDS.reduce((acc, { name }) => {
        acc[name] = {
          en: counter[name]?.en ?? '',
          ar: counter[name]?.ar ?? '',
        }
        return acc
      }, {} as CounterPayload),
    )
  }, [counter])

  const handleChange = (field: CounterField, lang: Lang, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (counter) {
        await updateCounter({ id: counter._id, data: formData }).unwrap()
        toast.success('Counter updated successfully')
      } else {
        await createCounter(formData).unwrap()
        toast.success('Counter created successfully')
      }
      // no manual refetch: the mutations invalidate the Counter tags
    } catch (error: any) {
      toast.error(error?.data?.message || 'Something went wrong')
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  const busy = creating || updating

  return (
    <form onSubmit={handleSubmit}>
      {LANGS.map(({ lang, heading }) => (
        <Card key={lang}>
          <CardHeader>
            <CardTitle as="h4">{heading}</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              {FIELDS.map(({ name, label, md }) => (
                <Col md={md} key={name}>
                  <div className="mb-3">
                    <label className="form-label" htmlFor={`${name}-${lang}`}>
                      {label}*
                    </label>
                    <input
                      id={`${name}-${lang}`}
                      type="text"
                      dir={lang === 'ar' ? 'rtl' : 'ltr'}
                      className="form-control"
                      name={`${name}-${lang}`}
                      value={formData[name][lang]}
                      onChange={(e) => handleChange(name, lang, e.target.value)}
                      required
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </CardBody>
        </Card>
      ))}

      {/* Submit */}
      <button type="submit" className="btn btn-primary w-100 mt-1" disabled={busy}>
        {busy ? 'Please wait...' : counter?._id ? 'Update counter' : 'Create counter'}
      </button>
    </form>
  )
}

export default Counter