"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetProductsByIdQuery } from "@/store/productsApi";

import ProductImages from "./ProductImages";
import ProductInfo from "./ProductInfo";
import ProductTabs from "./ProductTabs";
import { Lang, t, useCurrentLang } from "./i18n";

const UI: Record<string, { en: string; ar: string }> = {
  home: { en: "Home", ar: "الرئيسية" },
  products: { en: "Products", ar: "المنتجات" },
  notFound: { en: "Product not found.", ar: "المنتج غير موجود." },
  error: { en: "We couldn't load this product.", ar: "تعذر تحميل هذا المنتج." },
  retry: { en: "Try again", ar: "إعادة المحاولة" },
  back: { en: "Back to products", ar: "العودة إلى المنتجات" },
};

const safeDecode = (v: string) => {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
};

/**
 * Reads the product id from the route /products/[id].
 * You can also pass it in as `id` (or `param`) if you prefer.
 */
const ProductDetails = ({ id: idProp, param }: { id?: string; param?: string }) => {
  const lang: Lang = useCurrentLang();
  const params = useParams();

  const routeId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const rawId = idProp ?? param ?? routeId;
  const id = rawId ? safeDecode(rawId) : "";

  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetProductsByIdQuery(id, { skip: !id });

  // A 404 (or a deleted product) means "not found", anything else is a real error
  const notFound =
    !isLoading &&
    ((isError && "status" in error! && error.status === 404) ||
      (!isError && (!product || product.isDeleted)));
  const failed = !isLoading && isError && !notFound;

  return (
    <section
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="w-full bg-[#faf8f3] px-4 py-8 sm:px-6 lg:px-12 lg:py-12"
    >
      <div className="mx-auto max-w-7xl">
        {/* Loading */}
        {isLoading && (
          <div className="grid gap-8 lg:grid-cols-2" aria-busy="true">
            <div className="aspect-square animate-pulse rounded-2xl bg-white sm:aspect-4/3" />
            <div className="space-y-4">
              <div className="h-6 w-24 animate-pulse rounded-full bg-white" />
              <div className="h-10 w-3/4 animate-pulse rounded bg-white" />
              <div className="h-24 animate-pulse rounded bg-white" />
            </div>
          </div>
        )}

        {/* Error / not found */}
        {(failed || notFound) && (
          <div className="mx-auto max-w-xl rounded-2xl border border-[#e3e8df] bg-white p-8 text-center">
            <p className="text-sm text-slate-600">
              {t(failed ? UI.error : UI.notFound, lang)}
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              {failed && (
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="h-9 rounded-full border border-green-700 px-4 text-xs font-semibold text-green-800 transition hover:bg-green-800 hover:text-white"
                >
                  {t(UI.retry, lang)}
                </button>
              )}
              <Link
                href="/products-list"
                className="text-xs font-semibold text-green-800 hover:underline"
              >
                {t(UI.back, lang)}
              </Link>
            </div>
          </div>
        )}

        {product && !product.isDeleted && (
          <>
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="mb-6 text-xs text-slate-500"
            >
              <Link href="/" className="hover:text-green-800">
                {t(UI.home, lang)}
              </Link>
              <span className="mx-2">/</span>
              <Link href="/products-list" className="hover:text-green-800">
                {t(UI.products, lang)}
              </Link>
              <span className="mx-2">/</span>
              <span className="font-semibold text-slate-800">
                {t(product.productName, lang)}
              </span>
            </nav>

            {/* Top: images | info */}
            <div className="grid items-start gap-8 lg:grid-cols-2">
              <ProductImages
                images={product.images ?? []}
                name={t(product.productName, lang)}
              />
              <ProductInfo product={product} />
            </div>

            {/* Bottom: tabs */}
            <div className="mt-10">
              <ProductTabs product={product} />
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ProductDetails;