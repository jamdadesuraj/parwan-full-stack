import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '@/store'

/* -------------------------------- Types -------------------------------- */

export interface ILocalizedText {
  en: string
  ar: string
}

export interface IFeature {
  icon: string
  title: ILocalizedText
  desc: ILocalizedText
}

export interface IWhyChooseUs {
  _id: string
  title: ILocalizedText
  subTitle: ILocalizedText
  desc: ILocalizedText
  image: string
  features: IFeature[]
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

interface IApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}

/* ------------------------------ Constants ------------------------------ */

const TAG = 'WhyChooseUs' as const
const LIST_TAG = { type: TAG, id: 'LIST' } as const

const unwrap = <T>(response: IApiResponse<T>) => response.data

/* --------------------------------- API --------------------------------- */

export const whyChooseUsApi = createApi({
  reducerPath: 'whyChooseUsApi',

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth?.token
      if (token) headers.set('authorization', `Bearer ${token}`)
      return headers
    },
  }),

  tagTypes: [TAG],

  endpoints: (builder) => ({
    getWhyChooseUs: builder.query<IWhyChooseUs[], void>({
      query: () => 'why-choose-us',
      transformResponse: (res: IApiResponse<IWhyChooseUs[]>) => res.data ?? [],
      providesTags: (result) => [
        LIST_TAG,
        ...(result ?? []).map(({ _id }) => ({ type: TAG, id: _id })),
      ],
    }),

    getWhyChooseUsById: builder.query<IWhyChooseUs, string>({
      query: (id) => `why-choose-us/${id}`,
      transformResponse: unwrap<IWhyChooseUs>,
      providesTags: (_res, _err, id) => [{ type: TAG, id }],
    }),

    createWhyChooseUs: builder.mutation<IWhyChooseUs, FormData>({
      query: (body) => ({ url: 'why-choose-us', method: 'POST', body }),
      transformResponse: unwrap<IWhyChooseUs>,
      invalidatesTags: [LIST_TAG],
    }),

    updateWhyChooseUs: builder.mutation<
      IWhyChooseUs,
      { id: string; data: FormData }
    >({
      query: ({ id, data }) => ({
        url: `why-choose-us/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: unwrap<IWhyChooseUs>,
      invalidatesTags: (_res, _err, { id }) => [{ type: TAG, id }, LIST_TAG],
    }),

    deleteWhyChooseUs: builder.mutation<void, string>({
      query: (id) => ({ url: `why-choose-us/${id}`, method: 'DELETE' }),
      invalidatesTags: (_res, _err, id) => [{ type: TAG, id }, LIST_TAG],
    }),
  }),
})

export const {
  useGetWhyChooseUsQuery,
  useGetWhyChooseUsByIdQuery,
  useCreateWhyChooseUsMutation,
  useUpdateWhyChooseUsMutation,
  useDeleteWhyChooseUsMutation,
} = whyChooseUsApi