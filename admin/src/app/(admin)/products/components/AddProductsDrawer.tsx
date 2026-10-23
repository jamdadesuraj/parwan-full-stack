'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Col, Offcanvas, Row } from 'react-bootstrap'
import Swal from 'sweetalert2'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { ICategoryRef, IFaqItem, ILocalizedText, IProduct, IRow, MAX_IMAGES, useCreateProductsMutation } from '@/store/productsApi'
import { useGetcategoryQuery } from '@/store/categoriesApi'

// =====================================================
// HELPERS
// =====================================================

/** Category / product names can be a plain string or a { en, ar } object */
const getLocalizedName = (value: unknown): string => {
  if (!value) return ''

  if (typeof value === 'string') return value

  const text = value as Partial<ILocalizedText>

  return text.en?.trim() || text.ar?.trim() || ''
}

const getCategoryId = (category?: ICategoryRef | null): string => {
  if (!category) return ''

  return typeof category === 'string' ? category : category._id || ''
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  const err = error as { data?: { message?: string }; message?: string; error?: string } | undefined

  return err?.data?.message || err?.message || err?.error || fallback
}

// Unit options for the dropdown. `value` is what gets saved and shown as "/kg" on the product.
const UNIT_GROUPS: { group: string; units: { value: string; label: string }[] }[] = [
  {
    group: 'Weight',
    units: [
      { value: 'mg', label: 'Milligram (mg)' },
      { value: 'g', label: 'Gram (g)' },
      { value: 'kg', label: 'Kilogram (kg)' },
      { value: 'quintal', label: 'Quintal (100 kg)' },
      { value: 'ton', label: 'Metric ton (ton)' },
      { value: 'oz', label: 'Ounce (oz)' },
      { value: 'lb', label: 'Pound (lb)' },
    ],
  },
  {
    group: 'Volume',
    units: [
      { value: 'ml', label: 'Millilitre (ml)' },
      { value: 'l', label: 'Litre (l)' },
      { value: 'gal', label: 'Gallon (gal)' },
      { value: 'barrel', label: 'Barrel' },
    ],
  },
  {
    group: 'Count',
    units: [
      { value: 'pcs', label: 'Piece (pcs)' },
      { value: 'pair', label: 'Pair' },
      { value: 'dozen', label: 'Dozen' },
      { value: 'set', label: 'Set' },
    ],
  },
  {
    group: 'Packaging',
    units: [
      { value: 'bag', label: 'Bag' },
      { value: 'sack', label: 'Sack' },
      { value: 'box', label: 'Box' },
      { value: 'carton', label: 'Carton' },
      { value: 'pack', label: 'Pack' },
      { value: 'bottle', label: 'Bottle' },
      { value: 'can', label: 'Can' },
      { value: 'jar', label: 'Jar' },
      { value: 'bundle', label: 'Bundle' },
      { value: 'pallet', label: 'Pallet' },
      { value: 'container', label: 'Container' },
    ],
  },
  {
    group: 'Length & area',
    units: [
      { value: 'cm', label: 'Centimetre (cm)' },
      { value: 'm', label: 'Metre (m)' },
      { value: 'ft', label: 'Foot (ft)' },
      { value: 'sqm', label: 'Square metre (sqm)' },
      { value: 'sqft', label: 'Square foot (sqft)' },
    ],
  },
]

const ALL_UNIT_VALUES = UNIT_GROUPS.flatMap((group) => group.units.map((unit) => unit.value))

const emptyText = (): ILocalizedText => ({ en: '', ar: '' })
const emptyRow = (): IRow => ({ label: emptyText(), value: emptyText() })
const emptyFaq = (): IFaqItem => ({ question: emptyText(), answer: emptyText() })

const normalizeText = (value?: Partial<ILocalizedText>): ILocalizedText => ({
  en: value?.en ?? '',
  ar: value?.ar ?? '',
})

const cleanText = (value: ILocalizedText): ILocalizedText => ({ en: value.en.trim(), ar: value.ar.trim() })

const hasText = (value: ILocalizedText) => Boolean(value.en.trim() || value.ar.trim())

/** Sends { en, ar } as key[en] / key[ar] so the server receives a real object, not a JSON string */
const appendLocalized = (formData: FormData, key: string, value: ILocalizedText) => {
  formData.append(`${key}[en]`, value.en.trim())
  formData.append(`${key}[ar]`, value.ar.trim())
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// =====================================================
// SMALL FORM PIECES
// =====================================================

type Lang = 'en' | 'ar'

// The active language tab is shared with every LocalizedField through context
const LangContext = createContext<Lang>('en')

type LocalizedFieldProps = {
  label: string
  value: ILocalizedText
  onChange: (value: ILocalizedText) => void
  multiline?: boolean
  rows?: number
  required?: boolean
  placeholder?: string
}

/** Shows only the input for the language tab that is currently open */
const LocalizedField = ({ label, value, onChange, multiline, rows = 3, required, placeholder }: LocalizedFieldProps) => {
  const lang = useContext(LangContext)
  const isAr = lang === 'ar'

  const common = {
    className: 'form-control',
    placeholder,
    dir: isAr ? 'rtl' : 'ltr',
    value: value[lang],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...value, [lang]: e.target.value }),
  }

  return (
    <div className="mb-3">
      <label className="form-label">
        {label} <span className="text-muted small">({isAr ? 'Arabic' : 'English'})</span>
        {required && !isAr && <span className="text-danger"> *</span>}
      </label>

      {multiline ? <textarea {...common} rows={rows} /> : <input {...common} type="text" />}
    </div>
  )
}

type RepeaterProps<T> = {
  title: string
  hint?: string
  addLabel: string
  items: T[]
  onChange: (items: T[]) => void
  createItem: () => T
  children: (item: T, update: (next: T) => void, index: number) => React.ReactNode
}

/** Add / remove list of rows */
function Repeater<T>({ title, hint, addLabel, items, onChange, createItem, children }: RepeaterProps<T>) {
  return (
    <section className="mb-4">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div>
          <h6 className="mb-0">{title}</h6>
          {hint && <small className="text-muted">{hint}</small>}
        </div>

        <button type="button" className="btn btn-soft-primary btn-sm" onClick={() => onChange([...items, createItem()])}>
          <IconifyIcon icon="solar:add-circle-linear" width={16} className="me-1" />
          {addLabel}
        </button>
      </div>

      {items.length === 0 && <div className="text-muted small border rounded p-3 text-center">Nothing added yet.</div>}

      {items.map((item, index) => (
        <div key={index} className="border rounded p-3 mb-2 position-relative">
          <button
            type="button"
            className="btn btn-soft-danger btn-sm position-absolute top-0 inset-e-0 m-2"
            title="Remove"
            aria-label={`Remove ${title} ${index + 1}`}
            onClick={() => onChange(items.filter((_, i) => i !== index))}>
            <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" />
          </button>

          <div className="pe-5">{children(item, (next) => onChange(items.map((current, i) => (i === index ? next : current))), index)}</div>
        </div>
      ))}
    </section>
  )
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => <h5 className="border-bottom pb-2 mb-3 mt-4">{children}</h5>

// =====================================================
// FORM
// =====================================================

type ProductFormProps = {
  /** Pass an existing product to edit it */
  initial?: IProduct
  submitLabel: string
  /** Receives the ready-to-send FormData. Throw to show the error in the form. */
  onSubmit: (formData: FormData) => Promise<void>
  onCancel?: () => void
}

const ProductForm = ({ initial, submitLabel, onSubmit, onCancel }: ProductFormProps) => {
  const isEdit = Boolean(initial)

  const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError } = useGetcategoryQuery()

  // Basic
  const [productName, setProductName] = useState<ILocalizedText>(() => normalizeText(initial?.productName))
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(isEdit)
  const [category, setCategory] = useState(() => getCategoryId(initial?.category))

  // Pricing
  const [price, setPrice] = useState(initial?.price !== undefined ? String(initial.price) : '')
  const [unit, setUnit] = useState(initial?.unit ?? 'kg')
  const [delPrice, setDelPrice] = useState(initial?.delPrice !== undefined ? String(initial.delPrice) : '')
  const [minOrderQty, setMinOrderQty] = useState(initial?.minOrderQty !== undefined ? String(initial.minOrderQty) : '')
  const [rating, setRating] = useState(initial?.rating !== undefined ? String(initial.rating) : '')
  const [review, setReview] = useState(initial?.review !== undefined ? String(initial.review) : '')

  // Attributes
  const [shortDesc, setShortDesc] = useState<ILocalizedText>(() => normalizeText(initial?.shortDesc))
  const [origin, setOrigin] = useState<ILocalizedText>(() => normalizeText(initial?.origin))
  const [grade, setGrade] = useState<ILocalizedText>(() => normalizeText(initial?.grade))
  const [shelfLife, setShelfLife] = useState<ILocalizedText>(() => normalizeText(initial?.shelfLife))
  const [type, setType] = useState<ILocalizedText>(() => normalizeText(initial?.type))
  const [desc, setDesc] = useState<ILocalizedText>(() => normalizeText(initial?.desc))

  // Lists
  const [features, setFeatures] = useState<ILocalizedText[]>(() => (initial?.features ?? []).map(normalizeText))
  const [specifications, setSpecifications] = useState<IRow[]>(() =>
    (initial?.specifications ?? []).map((row) => ({ label: normalizeText(row.label), value: normalizeText(row.value) })),
  )
  const [packaging, setPackaging] = useState<IRow[]>(() =>
    (initial?.packagingAndDelivery ?? []).map((row) => ({ label: normalizeText(row.label), value: normalizeText(row.value) })),
  )
  const [faqs, setFaqs] = useState<IFaqItem[]>(() =>
    (initial?.faqs ?? []).map((faq) => ({ question: normalizeText(faq.question), answer: normalizeText(faq.answer) })),
  )

  // Images
  const [existingImages, setExistingImages] = useState<string[]>(initial?.images ?? [])
  const [newFiles, setNewFiles] = useState<File[]>([])

  const [lang, setLang] = useState<Lang>('en')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const previews = useMemo(() => newFiles.map((file) => URL.createObjectURL(file)), [newFiles])

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previews])

  const totalImages = existingImages.length + newFiles.length

  // -----------------------------------------------------
  // handlers
  // -----------------------------------------------------

  const handleNameChange = (value: ILocalizedText) => {
    setProductName(value)

    if (!slugTouched) setSlug(slugify(value.en))
  }

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? [])

    // allow picking the same file again later
    event.target.value = ''

    if (picked.length === 0) return

    const remaining = MAX_IMAGES - totalImages

    if (picked.length > remaining) {
      setError(`You can upload up to ${MAX_IMAGES} images. ${remaining > 0 ? `Only the first ${remaining} were added.` : 'Remove an image first.'}`)
    } else {
      setError('')
    }

    setNewFiles((prev) => [...prev, ...picked.slice(0, Math.max(remaining, 0))])
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    const priceNumber = Number(price)

    if (!productName.en.trim()) {
      setLang('en')
      return setError('Product name (English) is required.')
    }
    if (!slug.trim()) return setError('Slug is required.')
    if (!category.trim()) return setError('Please select a category.')
    if (!price || Number.isNaN(priceNumber) || priceNumber <= 0) return setError('Enter a valid price greater than 0.')
    if (!unit.trim()) return setError('Please select a unit.')
    if (delPrice && (Number.isNaN(Number(delPrice)) || Number(delPrice) < 0)) return setError('Old price must be a valid number.')
    if (minOrderQty && (Number.isNaN(Number(minOrderQty)) || Number(minOrderQty) < 0)) return setError('Minimum order must be a valid number.')
    if (rating && (Number.isNaN(Number(rating)) || Number(rating) < 0 || Number(rating) > 5)) return setError('Rating must be between 0 and 5.')
    if (review && (!Number.isInteger(Number(review)) || Number(review) < 0)) return setError('Reviews must be a whole number, 0 or more.')
    if (totalImages === 0) return setError('Add at least one product image.')

    const cleanRows = (rows: IRow[]) =>
      rows.filter((row) => hasText(row.label) || hasText(row.value)).map((row) => ({ label: cleanText(row.label), value: cleanText(row.value) }))

    const formData = new FormData()

    appendLocalized(formData, 'productName', productName)
    formData.append('slug', slug.trim())
    formData.append('category', category.trim())
    formData.append('price', String(priceNumber))
    formData.append('unit', unit.trim())

    if (delPrice) formData.append('delPrice', delPrice)
    if (minOrderQty) formData.append('minOrderQty', minOrderQty)
    if (rating) formData.append('rating', rating)
    if (review) formData.append('review', review)

    appendLocalized(formData, 'shortDesc', shortDesc)
    if (isEdit || hasText(origin)) appendLocalized(formData, 'origin', origin)
    if (isEdit || hasText(grade)) appendLocalized(formData, 'grade', grade)
    if (isEdit || hasText(shelfLife)) appendLocalized(formData, 'shelfLife', shelfLife)
    if (isEdit || hasText(type)) appendLocalized(formData, 'type', type)
    if (isEdit || hasText(desc)) appendLocalized(formData, 'desc', desc)

    formData.append('features', JSON.stringify(features.filter(hasText).map(cleanText)))
    formData.append('specifications', JSON.stringify(cleanRows(specifications)))
    formData.append('packagingAndDelivery', JSON.stringify(cleanRows(packaging)))
    formData.append(
      'faqs',
      JSON.stringify(
        faqs
          .filter((faq) => hasText(faq.question) || hasText(faq.answer))
          .map((faq) => ({ question: cleanText(faq.question), answer: cleanText(faq.answer) })),
      ),
    )

    // Images: kept URLs + newly uploaded files
    if (isEdit) formData.append('existingImages', JSON.stringify(existingImages))

    newFiles.forEach((file) => formData.append('images', file))

    setIsSubmitting(true)

    try {
      await onSubmit(formData)
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to save product. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // -----------------------------------------------------
  // render
  // -----------------------------------------------------

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="product-form-tabs">
        <ul className="nav nav-tabs" role="tablist">
          {(['en', 'ar'] as Lang[]).map((code) => (
            <li className="nav-item" key={code} role="presentation">
              <button
                type="button"
                role="tab"
                aria-selected={lang === code}
                className={`nav-link ${lang === code ? 'active' : ''}`}
                onClick={() => setLang(code)}>
                {code === 'en' ? 'English' : 'العربية'}
              </button>
            </li>
          ))}
        </ul>

        <p className="text-muted small mt-2 mb-0">Switch tabs to fill in each language. Slug, price, unit and images are shared.</p>
      </div>

      <LangContext.Provider value={lang}>
        {error && (
          <div className="alert alert-danger py-2" role="alert">
            {error}
          </div>
        )}

        {/* BASIC */}
        <SectionTitle>Basic information</SectionTitle>

        <LocalizedField label="Product name" required value={productName} onChange={handleNameChange} placeholder="e.g. Basmati Rice" />

        <Row className="g-3 mb-3">
          <Col md={6}>
            <label className="form-label" htmlFor="product-slug">
              Slug <span className="text-danger">*</span>
            </label>

            <input
              id="product-slug"
              type="text"
              className="form-control"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(slugify(e.target.value))
              }}
            />
          </Col>

          <Col md={6}>
            <label className="form-label" htmlFor="product-category">
              Category <span className="text-danger">*</span>
            </label>

            <select
              id="product-category"
              className="form-select"
              value={category}
              disabled={categoriesLoading}
              onChange={(e) => setCategory(e.target.value)}>
              <option value="">{categoriesLoading ? 'Loading categories...' : 'Select category'}</option>

              {/* keeps the current value visible if it is not in the loaded list */}
              {category && !categories.some((item) => item._id === category) && <option value={category}>Current category</option>}

              {categories.map((item) => (
                <option key={item._id} value={item._id}>
                  {getLocalizedName(item.categoryName)}
                </option>
              ))}
            </select>

            {categoriesError && <small className="text-danger">Unable to load categories. Refresh and try again.</small>}
          </Col>
        </Row>

        <LocalizedField label="Short description" multiline rows={2} value={shortDesc} onChange={setShortDesc} />

        {/* PRICING */}
        <SectionTitle>Pricing & ordering</SectionTitle>

        <Row className="g-3 mb-3">
          <Col md={3} sm={6}>
            <label className="form-label" htmlFor="product-price">
              Price <span className="text-danger">*</span>
            </label>

            <input
              id="product-price"
              type="number"
              min="0"
              step="any"
              className="form-control"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </Col>

          <Col md={3} sm={6}>
            <label className="form-label" htmlFor="product-unit">
              Unit <span className="text-danger">*</span>
            </label>

            <select id="product-unit" className="form-select" value={unit} onChange={(e) => setUnit(e.target.value)}>
              <option value="">Select unit</option>

              {/* keeps a saved unit visible even if it is not in the list */}
              {unit && !ALL_UNIT_VALUES.includes(unit) && <option value={unit}>{unit}</option>}

              {UNIT_GROUPS.map((group) => (
                <optgroup key={group.group} label={group.group}>
                  {group.units.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Col>

          <Col md={3} sm={6}>
            <label className="form-label" htmlFor="product-delprice">
              Old price
            </label>

            <input
              id="product-delprice"
              type="number"
              min="0"
              step="any"
              className="form-control"
              value={delPrice}
              onChange={(e) => setDelPrice(e.target.value)}
            />
          </Col>

          <Col md={3} sm={6}>
            <label className="form-label" htmlFor="product-minqty">
              Minimum order
            </label>

            <input
              id="product-minqty"
              type="number"
              min="0"
              step="any"
              className="form-control"
              value={minOrderQty}
              onChange={(e) => setMinOrderQty(e.target.value)}
            />
          </Col>

          <Col md={3} sm={6}>
            <label className="form-label" htmlFor="product-rating">
              Rating (0–5)
            </label>

            <input
              id="product-rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              className="form-control"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
          </Col>

          <Col md={3} sm={6}>
            <label className="form-label" htmlFor="product-review">
              Reviews (count)
            </label>

            <input
              id="product-review"
              type="number"
              min="0"
              step="1"
              className="form-control"
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
          </Col>
        </Row>

        {/* ATTRIBUTES */}
        <SectionTitle>Product attributes</SectionTitle>

        <LocalizedField label="Origin" value={origin} onChange={setOrigin} />
        <LocalizedField label="Grade" value={grade} onChange={setGrade} />
        <LocalizedField label="Shelf life" value={shelfLife} onChange={setShelfLife} />
        <LocalizedField label="Type" value={type} onChange={setType} />

        {/* IMAGES */}
        <SectionTitle>
          Images{' '}
          <small className="text-muted fw-normal">
            ({totalImages}/{MAX_IMAGES})
          </small>
        </SectionTitle>

        <div className="d-flex flex-wrap gap-2 mb-3">
          {existingImages.map((url, index) => (
            <div key={`${url}-${index}`} className="product-form-thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Product ${index + 1}`} />

              {index === 0 && <span className="product-form-thumb-main">Main</span>}

              <button type="button" aria-label="Remove image" onClick={() => setExistingImages((prev) => prev.filter((_, i) => i !== index))}>
                &times;
              </button>
            </div>
          ))}

          {previews.map((url, index) => (
            <div key={url} className="product-form-thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`New upload ${index + 1}`} />

              {existingImages.length === 0 && index === 0 && <span className="product-form-thumb-main">Main</span>}

              <button type="button" aria-label="Remove image" onClick={() => setNewFiles((prev) => prev.filter((_, i) => i !== index))}>
                &times;
              </button>
            </div>
          ))}

          {totalImages < MAX_IMAGES && (
            <label className="product-form-thumb product-form-upload" htmlFor="product-images">
              <IconifyIcon icon="solar:gallery-add-bold-duotone" width={26} />
              <span className="small mt-1">Add images</span>

              <input id="product-images" type="file" accept="image/*" multiple hidden onChange={handleFiles} />
            </label>
          )}
        </div>

        {/* DESCRIPTION */}
        <SectionTitle>Description</SectionTitle>

        <LocalizedField
          label="Description (HTML)"
          multiline
          rows={7}
          value={desc}
          onChange={setDesc}
          placeholder="<p>Write the full description…</p>"
        />

        {/* LISTS */}
        <SectionTitle>Details</SectionTitle>

        <Repeater<ILocalizedText> title="Features" addLabel="Add feature" items={features} onChange={setFeatures} createItem={emptyText}>
          {(item, update) => <LocalizedField label="Feature" value={item} onChange={update} />}
        </Repeater>

        <Repeater<IRow>
          title="Specifications"
          hint="Example: Moisture → 12% max"
          addLabel="Add row"
          items={specifications}
          onChange={setSpecifications}
          createItem={emptyRow}>
          {(item, update) => (
            <>
              <LocalizedField label="Label" value={item.label} onChange={(label) => update({ ...item, label })} />
              <LocalizedField label="Value" value={item.value} onChange={(value) => update({ ...item, value })} />
            </>
          )}
        </Repeater>

        <Repeater<IRow>
          title="Packaging & delivery"
          hint="Example: Packing → 25 kg PP bags"
          addLabel="Add row"
          items={packaging}
          onChange={setPackaging}
          createItem={emptyRow}>
          {(item, update) => (
            <>
              <LocalizedField label="Label" value={item.label} onChange={(label) => update({ ...item, label })} />
              <LocalizedField label="Value" value={item.value} onChange={(value) => update({ ...item, value })} />
            </>
          )}
        </Repeater>

        <Repeater<IFaqItem> title="FAQs" addLabel="Add FAQ" items={faqs} onChange={setFaqs} createItem={emptyFaq}>
          {(item, update) => (
            <>
              <LocalizedField label="Question" value={item.question} onChange={(question) => update({ ...item, question })} />
              <LocalizedField label="Answer" multiline rows={2} value={item.answer} onChange={(answer) => update({ ...item, answer })} />
            </>
          )}
        </Repeater>

        {/* ACTIONS */}
        <div className="product-form-actions d-flex justify-content-end gap-2">
          {onCancel && (
            <button type="button" className="btn btn-light" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </button>
          )}

          <button type="submit" className="btn btn-primary d-flex align-items-center gap-2" disabled={isSubmitting}>
            {isSubmitting && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />}
            {isSubmitting ? 'Saving...' : submitLabel}
          </button>
        </div>

        <style jsx global>{`
          .product-form-tabs {
            position: sticky;
            top: 0;
            z-index: 6;
            padding: 8px 0 10px;
            background: #fff;
          }

          .product-form-thumb {
            position: relative;
            width: 96px;
            height: 96px;
            overflow: hidden;
            border-radius: 10px;
            border: 1px solid #e5e7eb;
            background: #f8fafc;
          }

          .product-form-thumb img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .product-form-thumb button {
            position: absolute;
            top: 4px;
            right: 4px;
            width: 22px;
            height: 22px;
            padding: 0;
            border: 0;
            border-radius: 50%;
            color: #fff;
            background: rgba(15, 23, 42, 0.7);
            line-height: 1;
          }

          .product-form-thumb-main {
            position: absolute;
            left: 4px;
            bottom: 4px;
            padding: 1px 6px;
            border-radius: 5px;
            color: #fff;
            background: var(--bs-primary);
            font-size: 10px;
            font-weight: 600;
          }

          .product-form-upload {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-style: dashed;
            color: var(--bs-primary);
            cursor: pointer;
          }

          .product-form-actions {
            position: sticky;
            bottom: 0;
            z-index: 5;
            padding: 12px 0;
            margin-top: 8px;
            border-top: 1px solid #edf0f4;
            background: #fff;
          }
        `}</style>
      </LangContext.Provider>
    </form>
  )
}

// =====================================================
// ADD PRODUCT DRAWER
// =====================================================

const AddProductsDrawer = () => {
  const [show, setShow] = useState(false)

  const [createProduct] = useCreateProductsMutation()

  const handleSubmit = async (formData: FormData) => {
    // Errors are thrown to ProductForm, which shows them inside the drawer
    await createProduct(formData).unwrap()

    // Close the drawer first so the alert is not hidden behind it
    setShow(false)

    await Swal.fire({
      title: 'Product added',
      text: 'The product was created successfully.',
      icon: 'success',
      timer: 1600,
      showConfirmButton: false,
    })
  }

  return (
    <>
      <button type="button" className="btn btn-primary btn-sm d-flex align-items-center gap-2" onClick={() => setShow(true)}>
        <IconifyIcon icon="solar:add-circle-bold" width={17} />
        Add Product
      </button>

      <Offcanvas show={show} onHide={() => setShow(false)} placement="end" style={{ width: 'min(780px, 100vw)' }}>
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title as="h5">Add Product</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="pt-0">
          <ProductForm submitLabel="Add product" onSubmit={handleSubmit} onCancel={() => setShow(false)} />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  )
}

export default AddProductsDrawer
