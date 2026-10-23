import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface ILocalizedText {
  en: string;
  ar: string;
}

export interface ICategory {
  _id: string;
  categoryName: ILocalizedText;
  categoryDesc: ILocalizedText;
  categoryImg: string;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoryResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ICategory | ICategory[];
}

export const categoryApi = createApi({
  reducerPath: "categoryApi",

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
  }),

  tagTypes: ["Category"],

  endpoints: (builder) => ({
    getcategory: builder.query<ICategory[], void>({
      query: () => ({
        url: "/categories",
        method: "GET",
      }),

      transformResponse: (response: CategoryResponse): ICategory[] =>
        Array.isArray(response.data) ? response.data : [response.data],

      providesTags: (result) => [
        { type: "Category", id: "LIST" },
        ...(result ?? []).map(({ _id }) => ({
          type: "Category" as const,
          id: _id,
        })),
      ],
    }),

    getcategoryById: builder.query<ICategory, string>({
      query: (id) => `/categories/${id}`,

      transformResponse: (response: CategoryResponse) =>
        response.data as ICategory,

      providesTags: (_result, _error, id) => [{ type: "Category", id }],
    }),
  }),
});

export const { useGetcategoryQuery, useGetcategoryByIdQuery } = categoryApi;
