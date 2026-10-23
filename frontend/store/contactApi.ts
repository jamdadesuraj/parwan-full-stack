
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


export interface IContact {
  _id: string
  fullName: string
  emailAddress: string
  phone: string
  companyName: string
  productOfInterest: string
  requiredQty: string
  message: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export type ContactPayload = Pick<
  IContact,
  | 'fullName'
  | 'emailAddress'
  | 'phone'
  | 'companyName'
  | 'productOfInterest'
  | 'requiredQty'
  | 'message'
>

interface ContactResponse {
  success: boolean
  statusCode?: number
  message: string
  data: IContact | IContact[]
}

export const contactApi = createApi({
  reducerPath: 'contactApi',

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
  }),

  tagTypes: ['Contact'],

  endpoints: (builder) => ({
    getContact: builder.query<IContact[], void>({
      query: () => '/enquiries-contacts',

      transformResponse: (response: ContactResponse): IContact[] => {
        if (Array.isArray(response.data)) {
          return response.data
        }

        return response.data ? [response.data] : []
      },

      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: 'Contact' as const,
                id: _id,
              })),
              { type: 'Contact' as const, id: 'LIST' },
            ]
          : [{ type: 'Contact' as const, id: 'LIST' }],
    }),

    getContactById: builder.query<IContact, string>({
      query: (id) => `/enquiries-contacts/${id}`,

      transformResponse: (response: ContactResponse) =>
        response.data as IContact,

      providesTags: (_result, _error, id) => [
        { type: 'Contact', id },
      ],
    }),

    createContact: builder.mutation<IContact, ContactPayload>({
      query: (body) => ({
        url: '/enquiries-contacts',
        method: 'POST',
        body,
      }),

      transformResponse: (response: ContactResponse) =>
        response.data as IContact,

      invalidatesTags: [{ type: 'Contact', id: 'LIST' }],
    }),

    updateContact: builder.mutation<
      IContact,
      { id: string; data: FormData }
    >({
      query: ({ id, data }) => ({
        url: `/enquiries-contacts/${id}`,
        method: 'PUT',
        body: data,
      }),

      transformResponse: (response: ContactResponse) =>
        response.data as IContact,

      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Contact', id },
        { type: 'Contact', id: 'LIST' },
      ],
    }),

    deleteContact: builder.mutation<IContact, string>({
      query: (id) => ({
        url: `/enquiries-contacts/${id}`,
        method: 'DELETE',
      }),

      transformResponse: (response: ContactResponse) =>
        response.data as IContact,

      invalidatesTags: (_result, _error, id) => [
        { type: 'Contact', id },
        { type: 'Contact', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetContactQuery,
  useGetContactByIdQuery,
  useCreateContactMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
} = contactApi
