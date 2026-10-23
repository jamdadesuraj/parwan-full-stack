import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface ILocalizedText {
  en: string;
  ar: string;
}

export type HomeBannerStatus = "active" | "inactive";

export interface IHomeBanner {
  _id: string;
  title: ILocalizedText;
  subTitle: ILocalizedText;
  shortDesc: ILocalizedText;
  bgVideo?: string; // image or video URL
  status: HomeBannerStatus;
  createdAt: string;
  updatedAt: string;
}

interface HomeBannerResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export const homeBannerApi = createApi({
  reducerPath: "homeBannerApi",

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
  }),

  tagTypes: ["HomeBanner"],

  endpoints: (builder) => ({
    // list (optionally filter by status)
    getHomeBanner: builder.query<
      IHomeBanner[],
      { status?: HomeBannerStatus } | void
    >({
      query: (args) => ({
        url: "/home-banner",
        method: "GET",
        params: args?.status ? { status: args.status } : undefined,
      }),

      transformResponse: (response: HomeBannerResponse<IHomeBanner[]>) =>
        response.data ?? [],

      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "HomeBanner" as const,
                id: _id,
              })),
              { type: "HomeBanner" as const, id: "LIST" },
            ]
          : [{ type: "HomeBanner" as const, id: "LIST" }],
    }),

    // single
    getHomeBannerById: builder.query<IHomeBanner, string>({
      query: (id) => `/home-banner/${id}`,
      transformResponse: (response: HomeBannerResponse<IHomeBanner>) =>
        response.data,
      providesTags: (_result, _error, id) => [{ type: "HomeBanner", id }],
    }),
  }),
});

export const { useGetHomeBannerQuery, useGetHomeBannerByIdQuery } =
  homeBannerApi;
