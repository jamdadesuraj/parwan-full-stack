import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '@/store'

export interface ILocalizedText {
  en: string
  ar: string
}

export type HomeBannerStatus = 'active' | 'inactive'

export interface IHomeBanner {
  _id: string
  title: ILocalizedText
  subTitle: ILocalizedText
  shortDesc: ILocalizedText
  bgVideo?: string // image or video URL
  status: HomeBannerStatus
  createdAt: string
  updatedAt: string
}

interface HomeBannerResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}

export const homeBannerApi = createApi({
  reducerPath: 'homeBannerApi',

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,

    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState)?.auth?.token

      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }

      // Do NOT set Content-Type here. For FormData the browser must set
      // multipart/form-data with the boundary, otherwise multer can't parse
      // the body and req.file / req.body come through empty.
      return headers
    },
  }),

  tagTypes: ['HomeBanner'],

  endpoints: (builder) => ({
    // list (optionally filter by status)
    getHomeBanner: builder.query<IHomeBanner[], { status?: HomeBannerStatus } | void>({
      query: (args) => ({
        url: '/home-banner',
        method: 'GET',
        params: args?.status ? { status: args.status } : undefined,
      }),

      transformResponse: (response: HomeBannerResponse<IHomeBanner[]>) =>
        response.data ?? [],

      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'HomeBanner' as const, id: _id })),
              { type: 'HomeBanner' as const, id: 'LIST' },
            ]
          : [{ type: 'HomeBanner' as const, id: 'LIST' }],
    }),

    // single
    getHomeBannerById: builder.query<IHomeBanner, string>({
      query: (id) => `/home-banner/${id}`,
      transformResponse: (response: HomeBannerResponse<IHomeBanner>) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'HomeBanner', id }],
    }),

    // create
    createHomeBanner: builder.mutation<IHomeBanner, FormData>({
      query: (formData) => ({
        url: '/home-banner',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: HomeBannerResponse<IHomeBanner>) => response.data,
      invalidatesTags: [{ type: 'HomeBanner', id: 'LIST' }],
    }),

    // update
    updateHomeBanner: builder.mutation<IHomeBanner, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/home-banner/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: HomeBannerResponse<IHomeBanner>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'HomeBanner', id },
        { type: 'HomeBanner', id: 'LIST' },
      ],
    }),

    // delete
    deleteHomeBanner: builder.mutation<IHomeBanner, string>({
      query: (id) => ({
        url: `/home-banner/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: HomeBannerResponse<IHomeBanner>) => response.data,
      invalidatesTags: (_result, _error, id) => [
        { type: 'HomeBanner', id },
        { type: 'HomeBanner', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetHomeBannerQuery,
  useGetHomeBannerByIdQuery,
  useCreateHomeBannerMutation,
  useUpdateHomeBannerMutation,
  useDeleteHomeBannerMutation,
} = homeBannerApi