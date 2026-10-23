import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface ILocalizedText {
  en: string;
  ar: string;
}

export interface IPrivacy {
  _id: string;
  title: ILocalizedText;
  subTitle: ILocalizedText;
  shortDesc: ILocalizedText;
  content: ILocalizedText; // HTML from a rich-text editor
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PrivacyPayload = Pick<
  IPrivacy,
  "title" | "subTitle" | "shortDesc" | "content"
>;

interface IPrivacyResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IPrivacy | IPrivacy[];
}

export const privacyApi = createApi({
  reducerPath: "privacyApi",

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
  }),

  tagTypes: ["Privacy"],

  endpoints: (builder) => ({
    getPrivacy: builder.query<IPrivacy[], void>({
      query: () => "/privacy-policy",

      transformResponse: (response: IPrivacyResponse) => {
        if (Array.isArray(response.data)) return response.data;

        return response.data ? [response.data] : [];
      },

      providesTags: ["Privacy"],
    }),
  }),
});

export const { useGetPrivacyQuery } = privacyApi;
