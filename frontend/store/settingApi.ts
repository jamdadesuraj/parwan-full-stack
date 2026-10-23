import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface ILocalizedText {
  en: string;
  ar: string;
}

export interface ISetting {
  _id?: string;

  logo?: string;
  favicon?: string;

  mobileNo?: string;
  alternateMobileNo?: string;
  mail?: string;
  alternateEmail?: string;

  address?: ILocalizedText;
  addressIframe?: string;
  workingHrs?: ILocalizedText;

  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
  whatsApp?: string;

  footerDesc?: ILocalizedText;
  footerCopyrights?: ILocalizedText;

  createdAt?: string;
  updatedAt?: string;
}

interface ISettingResponse {
  message: string;
  success: boolean;
  statusCode: number;
  data: ISetting | null;
}

export const settingApi = createApi({
  reducerPath: "settingApi",

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
  }),

  tagTypes: ["Setting"],

  endpoints: (builder) => ({
    // Settings is a singleton: the backend returns one object or null
    getSettings: builder.query<ISetting | null, void>({
      query: () => "/settings",
      transformResponse: (response: ISettingResponse) => response.data ?? null,
      providesTags: ["Setting"],
    }),
  }),
});

export const { useGetSettingsQuery } = settingApi;
