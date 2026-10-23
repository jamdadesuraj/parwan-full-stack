import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/* -------------------------------- Types -------------------------------- */

export interface ILocalizedText {
  en: string;
  ar: string;
}

export interface IStep {
  icon: string;
  title: ILocalizedText;
  desc: ILocalizedText;
}

// what we send on create / update (JSON body, no file upload on this page)
export interface IHowToOrderPayload {
  title: ILocalizedText;
  subTitle: ILocalizedText;
  shortDesc: ILocalizedText;
  steps: IStep[];
}

export interface IHowToOrder extends IHowToOrderPayload {
  _id: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface IApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

/* ------------------------------ Constants ------------------------------ */

const TAG = "HowToOrder" as const;
const LIST_TAG = { type: TAG, id: "LIST" } as const;

const unwrap = <T>(response: IApiResponse<T>) => response.data;

/* --------------------------------- API --------------------------------- */

export const howToOrderApi = createApi({
  reducerPath: "howToOrderApi",

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
  }),

  tagTypes: [TAG],

  endpoints: (builder) => ({
    getHowToOrder: builder.query<IHowToOrder[], void>({
      query: () => "how-to-order",
      transformResponse: (res: IApiResponse<IHowToOrder[]>) => res.data ?? [],
      providesTags: (result) => [
        LIST_TAG,
        ...(result ?? []).map(({ _id }) => ({ type: TAG, id: _id })),
      ],
    }),

    getHowToOrderById: builder.query<IHowToOrder, string>({
      query: (id) => `how-to-order/${id}`,
      transformResponse: unwrap<IHowToOrder>,
      providesTags: (_res, _err, id) => [{ type: TAG, id }],
    }),
  }),
});

export const { useGetHowToOrderQuery, useGetHowToOrderByIdQuery } =
  howToOrderApi;
