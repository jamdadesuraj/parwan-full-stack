import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '@/store'

export interface ILocalizedText {
  en: string
  ar: string
}

export const COUNTER_FIELDS = [ 'happyCustomers', 'products', 'ordersDelivered', 'customerRating'] as const

export type CounterField = (typeof COUNTER_FIELDS)[number]

// what we send on create / update
export type CounterPayload = Record<CounterField, ILocalizedText>

// what the API returns
export interface ICounter extends CounterPayload {
  _id: string
  createdAt: string
  updatedAt: string
}

interface CounterResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}

export const counterApi = createApi({
  reducerPath: 'counterApi',

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,

    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState)?.auth?.token

      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }

      // JSON bodies: fetchBaseQuery sets Content-Type: application/json itself
      return headers
    },
  }),

  tagTypes: ['Counter'],

  endpoints: (builder) => ({
    getCounter: builder.query<ICounter[], void>({
      query: () => ({
        url: '/counter',
        method: 'GET',
      }),

      transformResponse: (response: CounterResponse<ICounter | ICounter[] | null>): ICounter[] => {
        if (!response.data) return []
        return Array.isArray(response.data) ? response.data : [response.data]
      },

      providesTags: (result) =>
        result
          ? [...result.map(({ _id }) => ({ type: 'Counter' as const, id: _id })), { type: 'Counter' as const, id: 'LIST' }]
          : [{ type: 'Counter' as const, id: 'LIST' }],
    }),

    getCounterById: builder.query<ICounter, string>({
      query: (id) => `/counter/${id}`,
      transformResponse: (response: CounterResponse<ICounter>) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Counter', id }],
    }),

    createCounter: builder.mutation<ICounter, CounterPayload>({
      query: (body) => ({
        url: '/counter',
        method: 'POST',
        body,
      }),
      transformResponse: (response: CounterResponse<ICounter>) => response.data,
      invalidatesTags: [{ type: 'Counter', id: 'LIST' }],
    }),

    updateCounter: builder.mutation<ICounter, { id: string; data: CounterPayload }>({
      query: ({ id, data }) => ({
        url: `/counter/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: CounterResponse<ICounter>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Counter', id },
        { type: 'Counter', id: 'LIST' },
      ],
    }),

    deleteCounter: builder.mutation<ICounter, string>({
      query: (id) => ({
        url: `/counter/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: CounterResponse<ICounter>) => response.data,
      invalidatesTags: (_result, _error, id) => [
        { type: 'Counter', id },
        { type: 'Counter', id: 'LIST' },
      ],
    }),
  }),
})

export const { useGetCounterQuery, useGetCounterByIdQuery, useCreateCounterMutation, useUpdateCounterMutation, useDeleteCounterMutation } = counterApi