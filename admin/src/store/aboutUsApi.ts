import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '@/store'

/* -------------------------------- Types -------------------------------- */

export interface ILocalizedText {
  en: string
  ar: string
}

export interface IHighlight {
  icon: string
  title: ILocalizedText
  desc: ILocalizedText
}

export interface IAboutUs {
  _id: string
  title: ILocalizedText
  subTitle: ILocalizedText
  highlightsTitle: ILocalizedText
  shortDesc: ILocalizedText
  img1: string
  highlights: IHighlight[]
  missionTitle: ILocalizedText
  missionSubTitle: ILocalizedText
  mission: ILocalizedText
  vision: ILocalizedText
  values: ILocalizedText[]
  whoWeAreTitle?: ILocalizedText
  whoWeAresubTitle?: ILocalizedText
  whoWeAreHightlightTitle?: ILocalizedText
  whoWeAreDesc?: ILocalizedText
  img2: string
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

const TAG = 'AboutUs' as const
const LIST_TAG = { type: TAG, id: 'LIST' } as const

const unwrap = <T>(response: IApiResponse<T>) => response.data

/* --------------------------------- API --------------------------------- */

export const aboutUsApi = createApi({
  reducerPath: 'aboutUsApi',

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
    getAboutUs: builder.query<IAboutUs[], void>({
      query: () => 'about-us',
      transformResponse: (res: IApiResponse<IAboutUs | IAboutUs[]>) =>
        Array.isArray(res.data) ? res.data : res.data ? [res.data] : [],
      providesTags: (result) => [
        LIST_TAG,
        ...(result ?? []).map(({ _id }) => ({ type: TAG, id: _id })),
      ],
    }),

    getAboutUsById: builder.query<IAboutUs, string>({
      query: (id) => `about-us/${id}`,
      transformResponse: unwrap<IAboutUs>,
      providesTags: (_res, _err, id) => [{ type: TAG, id }],
    }),

    createAboutUs: builder.mutation<IAboutUs, FormData>({
      query: (body) => ({ url: 'about-us', method: 'POST', body }),
      transformResponse: unwrap<IAboutUs>,
      invalidatesTags: [LIST_TAG],
    }),

    updateAboutUs: builder.mutation<IAboutUs, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `about-us/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: unwrap<IAboutUs>,
      invalidatesTags: (_res, _err, { id }) => [{ type: TAG, id }, LIST_TAG],
    }),

    deleteAboutUs: builder.mutation<void, string>({
      query: (id) => ({ url: `about-us/${id}`, method: 'DELETE' }),
      invalidatesTags: (_res, _err, id) => [{ type: TAG, id }, LIST_TAG],
    }),
  }),
})

export const {
  useGetAboutUsQuery,
  useGetAboutUsByIdQuery,
  useCreateAboutUsMutation,
  useUpdateAboutUsMutation,
  useDeleteAboutUsMutation,
} = aboutUsApi