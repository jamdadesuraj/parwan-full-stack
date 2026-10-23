
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store";

export const BUSINESS_TYPES = [
  "retailer",
  "distributor",
  "hotel_restaurant",
  "caterer_sweet_shop",
  "exporter",
  "other",
] as const;

export const ORDER_FREQUENCIES = [
  "one_time",
  "weekly",
  "monthly",
] as const;

export const QUALITY_GRADES = [
  "premium",
  "standard",
  "not_sure",
] as const;

export const PACKAGING_TYPES = [
  "loose_bulk",
  "vacuum_packed",
  "retail_packs",
  "private_label",
] as const;

export const UNITS = [
  "g",
  "kg",
  "ton",
  "oz",
  "lb",
  "ml",
  "l",
  "pcs",
  "dozen",
  "pack",
  "box",
  "carton",
  "bag",
  "sack",
  "tray",
  "tin",
  "jar",
  "bottle",
  "pallet",
  "container",
] as const;

export const ENQUIRY_STATUSES = [
  "new",
  "contacted",
  "closed",
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];
export type OrderFrequency = (typeof ORDER_FREQUENCIES)[number];
export type QualityGrade = (typeof QUALITY_GRADES)[number];
export type PackagingType = (typeof PACKAGING_TYPES)[number];
export type EnquiryUnit = (typeof UNITS)[number];
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export interface IProductEnquiry {
  _id: string;
  fullName: string;
  companyName?: string;
  phone: string;
  email: string;
  businessType: BusinessType;
  product: string;
  quantity: number;
  unit: EnquiryUnit;
  orderFrequency: OrderFrequency;
  qualityGrade: QualityGrade;
  packaging: PackagingType;
  city: string;
  country: string;
  notes?: string;
  status: EnquiryStatus;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProductEnquiryPayload = Omit<
  IProductEnquiry,
  "_id" | "status" | "isDeleted" | "createdAt" | "updatedAt"
>;

export interface ProductEnquiryResponse {
  success: boolean;
  statusCode?: number;
  message: string;
  data?: IProductEnquiry | IProductEnquiry[] | null;
}




const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const ProductEnquiryApi = createApi({
  reducerPath: "ProductEnquiryApi",

  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth?.token;

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: ["ProductEnquiry"],

  endpoints: (builder) => ({
    getProductEnquiries: builder.query<IProductEnquiry[], void>({
      query: () => "/enquiries",

      transformResponse: (
        response: ProductEnquiryResponse | IProductEnquiry[]
      ): IProductEnquiry[] => {
        const records = Array.isArray(response)
          ? response
          : response.data;

        if (!records) return [];

        const list = Array.isArray(records) ? records : [records];

        // Hide soft-deleted records if the API returns them.
        return list.filter((item) => !item.isDeleted);
      },

      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "ProductEnquiry" as const,
                id: _id,
              })),
              { type: "ProductEnquiry" as const, id: "LIST" },
            ]
          : [{ type: "ProductEnquiry" as const, id: "LIST" }],
    }),

    getProductEnquiryById: builder.query<IProductEnquiry, string>({
      query: (id) => `/enquiries/${id}`,

      transformResponse: (
        response: ProductEnquiryResponse | IProductEnquiry
      ): IProductEnquiry => {
        if ("_id" in response) return response;

        if (!response.data || Array.isArray(response.data)) {
          throw new Error("Product enquiry not found");
        }

        return response.data;
      },

      providesTags: (_result, _error, id) => [
        { type: "ProductEnquiry", id },
      ],
    }),

    createProductEnquiry: builder.mutation<
      IProductEnquiry,
      ProductEnquiryPayload
    >({
      query: (body) => ({
        url: "/enquiries",
        method: "POST",
        body,
      }),

      transformResponse: (
        response: ProductEnquiryResponse | IProductEnquiry
      ): IProductEnquiry => {
        if ("_id" in response) return response;

        if (!response.data || Array.isArray(response.data)) {
          throw new Error("Invalid create enquiry response");
        }

        return response.data;
      },

      invalidatesTags: [
        { type: "ProductEnquiry", id: "LIST" },
      ],
    }),

    deleteProductEnquiry: builder.mutation<
      unknown,
      string
    >({
      query: (id) => ({
        url: `/enquiries/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: (_result, _error, id) => [
        { type: "ProductEnquiry", id },
        { type: "ProductEnquiry", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetProductEnquiriesQuery,
  useGetProductEnquiryByIdQuery,
  useCreateProductEnquiryMutation,
  useDeleteProductEnquiryMutation,
} = ProductEnquiryApi;

export default ProductEnquiryApi;
