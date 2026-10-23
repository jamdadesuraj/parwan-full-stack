import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '@/store'

export interface ILocalizedText {
  en: string
  ar: string
}

export type FaqStatus = 'active' | 'inactive'

export interface IFaq {
  _id: string
  question: ILocalizedText
  answer: ILocalizedText
  status?: FaqStatus
  createdAt?: string
  updatedAt?: string
}

// What the Add / Edit drawers send (status is only sent by Edit)
export type FaqPayload = Pick<IFaq, 'question' | 'answer'> & { status?: FaqStatus }

interface FaqResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}

export const faqApi = createApi({
  reducerPath: 'faqApi',

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,

    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState)?.auth?.token

      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }

      return headers
    },
  }),

  tagTypes: ['Faq'],

  endpoints: (builder) => ({
    // list (client-side search + pagination in Faq.tsx, so no params)
    getFaqs: builder.query<IFaq[], void>({
      query: () => ({
        url: '/faq',
        method: 'GET',
      }),

      transformResponse: (response: FaqResponse<IFaq[]>) => response.data ?? [],

      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Faq' as const, id: _id })),
              { type: 'Faq' as const, id: 'LIST' },
            ]
          : [{ type: 'Faq' as const, id: 'LIST' }],
    }),

    // single
    getFaqById: builder.query<IFaq, string>({
      query: (id) => `/faq/${id}`,
      transformResponse: (response: FaqResponse<IFaq>) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Faq', id }],
    }),

    // create
    createFaq: builder.mutation<IFaq, FaqPayload>({
      query: (body) => ({
        url: '/faq',
        method: 'POST',
        body,
      }),
      transformResponse: (response: FaqResponse<IFaq>) => response.data,
      invalidatesTags: [{ type: 'Faq', id: 'LIST' }],
    }),

    // update (EditFaqDrawer calls updateFaq({ id, data }))
    updateFaq: builder.mutation<IFaq, { id: string; data: FaqPayload }>({
      query: ({ id, data }) => ({
        url: `/faq/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: FaqResponse<IFaq>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Faq', id },
        { type: 'Faq', id: 'LIST' },
      ],
    }),

    // delete (single; bulk delete in Faq.tsx runs this in parallel)
    deleteFaq: builder.mutation<IFaq, string>({
      query: (id) => ({
        url: `/faq/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: FaqResponse<IFaq>) => response.data,
      invalidatesTags: (_result, _error, id) => [
        { type: 'Faq', id },
        { type: 'Faq', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetFaqsQuery,
  useGetFaqByIdQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
} = faqApi