import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/* -------------------------------- Types -------------------------------- */

export interface ILocalizedText {
  en: string;
  ar: string;
}

export interface IHighlight {
  icon: string;
  title: ILocalizedText;
  desc: ILocalizedText;
}

export interface IAboutUs {
  _id: string;
  title: ILocalizedText;
  subTitle: ILocalizedText;
  highlightsTitle: ILocalizedText;
  shortDesc: ILocalizedText;
  img1: string;
  highlights: IHighlight[];
  missionTitle: ILocalizedText;
  missionSubTitle: ILocalizedText;
  mission: ILocalizedText;
  vision: ILocalizedText;
  values: ILocalizedText[];
  whoWeAreTitle?: ILocalizedText;
  whoWeAresubTitle?: ILocalizedText;
  whoWeAreHightlightTitle?: ILocalizedText;
  whoWeAreDesc?: ILocalizedText;
  img2: string;
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

const TAG = "AboutUs" as const;
const LIST_TAG = { type: TAG, id: "LIST" } as const;

const unwrap = <T>(response: IApiResponse<T>) => response.data;

/* --------------------------------- API --------------------------------- */

export const aboutUsApi = createApi({
  reducerPath: "aboutUsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
  }),

  tagTypes: [TAG],

  endpoints: (builder) => ({
    getAboutUs: builder.query<IAboutUs[], void>({
      query: () => "about-us",
      transformResponse: (res: IApiResponse<IAboutUs | IAboutUs[]>) =>
        Array.isArray(res.data) ? res.data : res.data ? [res.data] : [],
      providesTags: (result) => [
        LIST_TAG,
        ...(result ?? []).map(({ _id }) => ({ type: TAG, id: _id })),
      ],
    }),

    getAboutUsById: builder.query<IAboutUs, string>({
      query: (id) => `about-us/${id}`,
      transformResponse: unwrap<IAboutUs>,
      providesTags: (_res, _err, id) => [{ type: TAG, id }],
    }),
  }),
});

export const { useGetAboutUsQuery, useGetAboutUsByIdQuery } = aboutUsApi;
