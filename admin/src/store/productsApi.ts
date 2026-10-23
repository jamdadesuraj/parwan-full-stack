import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '@/store'

// =====================================================
// CONSTANTS
// =====================================================

export const MAX_IMAGES = 10

// =====================================================
// TYPES
// =====================================================

export interface ILocalizedText {
  en: string
  ar: string
}

// Specification / packaging row
export interface IRow {
  label: ILocalizedText
  value: ILocalizedText
}

export interface IFaqItem {
  question: ILocalizedText
  answer: ILocalizedText
}

// Category can come back as an id or as a populated object
export type ICategoryRef = string | { _id?: string; categoryName?: string; name?: string }

export interface IProduct {
  _id: string

  images: string[]
  category: ICategoryRef
  slug: string
  productName: ILocalizedText
  rating: number
  review: number
  price: number
  unit: string // "kg" -> shown as "/kg"
  delPrice?: number // old price, shown struck through
  minOrderQty?: number
  shortDesc: ILocalizedText
  origin?: ILocalizedText
  grade?: ILocalizedText
  shelfLife?: ILocalizedText
  type?: ILocalizedText
  features: ILocalizedText[]
  desc?: ILocalizedText // HTML from a rich-text editor
  specifications: IRow[]
  packagingAndDelivery: IRow[]
  faqs: IFaqItem[]
  discountPercent?: number // virtual
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

// =====================================================
// API RESPONSE
// =====================================================

export interface ProductsResponse<T = IProduct | IProduct[]> {
  success: boolean
  statusCode: number
  message: string
  data: T
}

// =====================================================
// PRODUCTS API
// =====================================================

export const productsApi = createApi({
  reducerPath: 'productsApi',

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,

    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState)?.auth?.token

      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }

      // Don't manually set Content-Type when using FormData.
      // Browser automatically adds multipart/form-data boundary.

      return headers
    },
  }),

  tagTypes: ['Products'],

  endpoints: (builder) => ({
    // GET ALL PRODUCTS
    getProducts: builder.query<IProduct[], void>({
      query: () => ({
        url: '/products',
        method: 'GET',
      }),

      transformResponse: (response: ProductsResponse<IProduct | IProduct[]>): IProduct[] => {
        if (Array.isArray(response.data)) return response.data

        return response.data ? [response.data] : []
      },

      providesTags: (result) =>
        result
          ? [...result.map((product) => ({ type: 'Products' as const, id: product._id })), { type: 'Products' as const, id: 'LIST' }]
          : [{ type: 'Products' as const, id: 'LIST' }],
    }),

    // GET PRODUCT BY ID
    getProductsById: builder.query<IProduct, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'GET',
      }),

      transformResponse: (response: ProductsResponse<IProduct>): IProduct => response.data,

      providesTags: (_result, _error, id) => [{ type: 'Products', id }],
    }),

    // CREATE PRODUCT (FormData: images + text)
    createProducts: builder.mutation<IProduct, FormData>({
      query: (formData) => ({
        url: '/products',
        method: 'POST',
        body: formData,
      }),

      transformResponse: (response: ProductsResponse<IProduct>): IProduct => response.data,

      invalidatesTags: [{ type: 'Products', id: 'LIST' }],
    }),

    // UPDATE PRODUCT (FormData: images + text)
    updateProducts: builder.mutation<IProduct, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: data,
      }),

      transformResponse: (response: ProductsResponse<IProduct>): IProduct => response.data,

      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Products', id },
        { type: 'Products', id: 'LIST' },
      ],
    }),

    // DELETE PRODUCT
    deleteProducts: builder.mutation<IProduct, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),

      transformResponse: (response: ProductsResponse<IProduct>): IProduct => response.data,

      invalidatesTags: (_result, _error, id) => [
        { type: 'Products', id },
        { type: 'Products', id: 'LIST' },
      ],
    }),
  }),
})

// =====================================================
// EXPORT HOOKS
// =====================================================

export const { useGetProductsQuery, useGetProductsByIdQuery, useCreateProductsMutation, useUpdateProductsMutation, useDeleteProductsMutation } =
  productsApi