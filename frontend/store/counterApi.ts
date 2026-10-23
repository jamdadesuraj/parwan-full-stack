import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface ILocalizedText {
  en: string;
  ar: string;
}

export const COUNTER_FIELDS = [
  "happyCustomers",
  "products",
  "ordersDelivered",
  "customerRating",
] as const;

export type CounterField = (typeof COUNTER_FIELDS)[number];

// what we send on create / update
export type CounterPayload = Record<CounterField, ILocalizedText>;

// what the API returns
export interface ICounter extends CounterPayload {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

interface CounterResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export const counterApi = createApi({
  reducerPath: "counterApi",

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
  }),

  tagTypes: ["Counter"],

  endpoints: (builder) => ({
    getCounter: builder.query<ICounter[], void>({
      query: () => ({
        url: "/counter",
        method: "GET",
      }),

      transformResponse: (
        response: CounterResponse<ICounter | ICounter[] | null>,
      ): ICounter[] => {
        if (!response.data) return [];
        return Array.isArray(response.data) ? response.data : [response.data];
      },

      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "Counter" as const,
                id: _id,
              })),
              { type: "Counter" as const, id: "LIST" },
            ]
          : [{ type: "Counter" as const, id: "LIST" }],
    }),

    getCounterById: builder.query<ICounter, string>({
      query: (id) => `/counter/${id}`,
      transformResponse: (response: CounterResponse<ICounter>) => response.data,
      providesTags: (_result, _error, id) => [{ type: "Counter", id }],
    }),
  }),
});

export const { useGetCounterQuery, useGetCounterByIdQuery } = counterApi;
