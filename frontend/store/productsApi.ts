import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// =====================================================
// CONSTANTS
// =====================================================

export const MAX_IMAGES = 10;

// =====================================================
// TYPES
// =====================================================

export interface ILocalizedText {
  en: string;
  ar: string;
}

// Specification / packaging row
export interface IRow {
  label: ILocalizedText;
  value: ILocalizedText;
}

export interface IFaqItem {
  question: ILocalizedText;
  answer: ILocalizedText;
}

// Category can come back as an id or as a populated object.
// Its name may be a plain string or a localized { en, ar } object.
export type ICategoryRef =
  | string
  | {
      _id?: string;
      categoryName?: string | ILocalizedText;
      name?: string | ILocalizedText;
    };

// A category from GET /categories
export interface ICategory {
  _id: string;
  categoryName: string | ILocalizedText;
  categoryImg?: string;
  isDeleted?: boolean;
}

export interface IProduct {
  _id: string;

  images: string[];
  category: ICategoryRef;
  slug: string;
  productName: ILocalizedText;
  rating: number;
  review: number;
  price: number;
  unit: string; // "kg" -> shown as "/kg"
  delPrice?: number; // old price, shown struck through
  minOrderQty?: number;
  shortDesc: ILocalizedText;
  origin?: ILocalizedText;
  grade?: ILocalizedText;
  shelfLife?: ILocalizedText;
  type?: ILocalizedText;
  features: ILocalizedText[];
  desc?: ILocalizedText; // HTML from a rich-text editor
  specifications: IRow[];
  packagingAndDelivery: IRow[];
  faqs: IFaqItem[];
  discountPercent?: number; // virtual
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// =====================================================
// API RESPONSE
// =====================================================

export interface ProductsResponse<T = IProduct | IProduct[]> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface ProductsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ProductsListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  meta?: ProductsMeta;
  data: IProduct[];
}

export interface ProductsListResult {
  items: IProduct[];
  meta: ProductsMeta;
}

// Query options for the list page. All optional.
export interface ProductsListArgs {
  search?: string;
  category?: string; // category _id
  sort?: string; // newest | price-asc | price-desc | name-asc | name-desc | rating-desc
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
}

// =====================================================
// PRODUCTS API
// =====================================================

export const productsApi = createApi({
  reducerPath: "productsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
  }),

  tagTypes: ["Products"],

  endpoints: (builder) => ({
    // GET ALL PRODUCTS (first page only; the server default limit is 20)
    getProducts: builder.query<IProduct[], void>({
      query: () => ({
        url: "/products",
        method: "GET",
      }),

      transformResponse: (
        response: ProductsResponse<IProduct | IProduct[]>,
      ): IProduct[] => {
        if (Array.isArray(response.data)) return response.data;

        return response.data ? [response.data] : [];
      },

      providesTags: (result) =>
        result
          ? [
              ...result.map((product) => ({
                type: "Products" as const,
                id: product._id,
              })),
              { type: "Products" as const, id: "LIST" },
            ]
          : [{ type: "Products" as const, id: "LIST" }],
    }),

    // GET PRODUCTS: search + category filter + sort + pagination (server side)
    getProductsList: builder.query<ProductsListResult, ProductsListArgs | void>({
      query: (args) => {
        const params = new URLSearchParams();
        const a = args ?? {};

        if (a.search?.trim()) params.set("search", a.search.trim());
        if (a.category) params.set("category", a.category);
        if (a.sort) params.set("sort", a.sort);
        if (a.page) params.set("page", String(a.page));
        if (a.limit) params.set("limit", String(a.limit));
        if (a.minPrice !== undefined) params.set("minPrice", String(a.minPrice));
        if (a.maxPrice !== undefined) params.set("maxPrice", String(a.maxPrice));

        const qs = params.toString();
        return { url: qs ? `/products?${qs}` : "/products", method: "GET" };
      },

      transformResponse: (response: ProductsListResponse): ProductsListResult => {
        const items = Array.isArray(response.data) ? response.data : [];
        return {
          items,
          meta: response.meta ?? {
            page: 1,
            limit: items.length,
            total: items.length,
            totalPages: 1,
          },
        };
      },

      providesTags: (result) =>
        result
          ? [
              ...result.items.map((product) => ({
                type: "Products" as const,
                id: product._id,
              })),
              { type: "Products" as const, id: "LIST" },
            ]
          : [{ type: "Products" as const, id: "LIST" }],
    }),

    // GET PRODUCT BY ID (the backend also accepts a slug here)
    getProductsById: builder.query<IProduct, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "GET",
      }),

      transformResponse: (response: ProductsResponse<IProduct>): IProduct =>
        response.data,

      providesTags: (_result, _error, id) => [{ type: "Products", id }],
    }),

    // GET CATEGORIES (for the filter chips)
    getProductCategories: builder.query<ICategory[], void>({
      query: () => ({ url: "/categories", method: "GET" }),

      transformResponse: (response: {
        data?: ICategory[] | ICategory;
      }): ICategory[] => {
        if (Array.isArray(response.data)) return response.data;
        return response.data ? [response.data] : [];
      },
    }),
  }),
});

// =====================================================
// EXPORT HOOKS
// =====================================================

export const {
  useGetProductsQuery,
  useGetProductsListQuery,
  useGetProductsByIdQuery,
  useGetProductCategoriesQuery,
} = productsApi;