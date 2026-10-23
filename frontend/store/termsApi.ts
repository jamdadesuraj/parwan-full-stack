import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface ILocalizedText {
  en: string;
  ar: string;
}

export interface ITerms {
  _id: string;
  title: ILocalizedText;
  subTitle: ILocalizedText;
  shortDesc: ILocalizedText;
  content: ILocalizedText; // HTML from a rich-text editor
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
export type TermsPayload = Pick<
  ITerms,
  "title" | "subTitle" | "shortDesc" | "content"
>;

interface ITermsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ITerms | ITerms[];
}

export const termsApi = createApi({
  reducerPath: "termsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
  }),

  tagTypes: ["Terms"],

  endpoints: (builder) => ({
    getTerms: builder.query<ITerms[], void>({
      query: () => "/terms-and-conditions",

      transformResponse: (response: ITermsResponse) => {
        if (Array.isArray(response.data)) return response.data;

        return response.data ? [response.data] : [];
      },

      providesTags: ["Terms"],
    }),
  }),
});

export const { useGetTermsQuery } = termsApi;
