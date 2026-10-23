import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface ILocalizedText {
  en: string
  ar: string
}

export interface ISetting {
  _id?: string

  logo?: string
  favicon?: string

  mobileNo?: string
  alternateMobileNo?: string
  mail?: string
  alternateEmail?: string

  address?: ILocalizedText
  addressIframe?: string // Google Maps embed URL (src only)
  workingHrs?: ILocalizedText

  facebook?: string
  instagram?: string
  linkedin?: string
  twitter?: string
  youtube?: string
  whatsApp?: string

  footerDesc?: ILocalizedText
  footerCopyrights?: ILocalizedText

  createdAt?: string
  updatedAt?: string
}

interface ISettingResponse {
  message: string
  success: boolean
  statusCode: number
  data: ISetting | null
}

export const settingApi = createApi({
  reducerPath: 'settingApi',

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,

    // Do NOT set Content-Type: FormData needs the browser's multipart boundary.
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState)?.auth?.token
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return headers
    },
  }),

  tagTypes: ['Setting'],

  endpoints: (builder) => ({
    // Settings is a singleton: backend returns one object or null
    getSettings: builder.query<ISetting | null, void>({
      query: () => '/settings',
      transformResponse: (response: ISettingResponse) => response.data ?? null,
      providesTags: ['Setting'],
    }),

    createSetting: builder.mutation<ISetting, FormData>({
      query: (formData) => ({ url: '/settings', method: 'POST', body: formData }),
      transformResponse: (response: ISettingResponse) => response.data as ISetting,
      invalidatesTags: ['Setting'],
    }),

    // No id: the backend updates the single settings document
    updateSetting: builder.mutation<ISetting, FormData>({
      query: (formData) => ({ url: '/settings', method: 'PUT', body: formData }),
      transformResponse: (response: ISettingResponse) => response.data as ISetting,
      invalidatesTags: ['Setting'],
    }),
  }),
})

export const { useGetSettingsQuery, useCreateSettingMutation, useUpdateSettingMutation } = settingApi
