
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '@/store'

export interface ILocalizedText {
  en: string
  ar: string
}

export interface ICategory {
  _id: string
  categoryName: ILocalizedText
  categoryDesc: ILocalizedText
  categoryImg: string
  status: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

interface CategoryResponse {
  success: boolean
  statusCode: number
  message: string
  data: ICategory | ICategory[]
}

export const categoryApi = createApi({
  reducerPath: 'categoryApi',

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState)?.auth?.token

      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }

      // Do not set Content-Type manually for FormData.
      return headers
    },
  }),

  tagTypes: ['Category'],

  endpoints: (builder) => ({
    getcategory: builder.query<ICategory[], void>({
      query: () => ({
        url: '/categories',
        method: 'GET',
      }),

      transformResponse: (response: CategoryResponse): ICategory[] =>
        Array.isArray(response.data)
          ? response.data
          : [response.data],

      providesTags: (result) => [
        { type: 'Category', id: 'LIST' },
        ...(result ?? []).map(({ _id }) => ({
          type: 'Category' as const,
          id: _id,
        })),
      ],
    }),

    getcategoryById: builder.query<ICategory, string>({
      query: (id) => `/categories/${id}`,

      transformResponse: (response: CategoryResponse) =>
        response.data as ICategory,

      providesTags: (_result, _error, id) => [
        { type: 'Category', id },
      ],
    }),

    createcategory: builder.mutation<ICategory, FormData>({
      query: (formData) => ({
        url: '/categories',
        method: 'POST',
        body: formData,
      }),

      transformResponse: (response: CategoryResponse) =>
        response.data as ICategory,

      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    updatecategory: builder.mutation<
      ICategory,
      { id: string; data: FormData }
    >({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: data,
      }),

      transformResponse: (response: CategoryResponse) =>
        response.data as ICategory,

      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
    }),

    deletecategory: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),

      invalidatesTags: (_result, _error, id) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetcategoryQuery,
  useGetcategoryByIdQuery,
  useCreatecategoryMutation,
  useUpdatecategoryMutation,
  useDeletecategoryMutation,
} = categoryApi
