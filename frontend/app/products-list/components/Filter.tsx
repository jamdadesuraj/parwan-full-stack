"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, ArrowUpDown, X } from "lucide-react";

type Lang = "en" | "ar";

export type FilterCategory = { id: string; label: string };

const UI = {
  search: {
    en: "Search for nuts, fruits, spices...",
    ar: "ابحث عن المكسرات والفواكه والتوابل...",
  },
  clearSearch: { en: "Clear search", ar: "مسح البحث" },
  sortBy: { en: "Sort by", ar: "ترتيب حسب" },
  all: { en: "All", ar: "الكل" },
  categories: { en: "Categories", ar: "الفئات" },
};

const SORT_OPTIONS: { value: string; label: Record<Lang, string> }[] = [
  { value: "", label: { en: "Newest", ar: "الأحدث" } },
  { value: "price-asc", label: { en: "Price: Low to High", ar: "السعر: من الأقل إلى الأعلى" } },
  { value: "price-desc", label: { en: "Price: High to Low", ar: "السعر: من الأعلى إلى الأقل" } },
  { value: "name-asc", label: { en: "Name: A to Z", ar: "الاسم: أ إلى ي" } },
  { value: "name-desc", label: { en: "Name: Z to A", ar: "الاسم: ي إلى أ" } },
  { value: "rating-desc", label: { en: "Top rated", ar: "الأعلى تقييماً" } },
];

const SEARCH_DEBOUNCE_MS = 400;

type Props = {
  lang: Lang;
  categories: FilterCategory[];
};

const Filter = ({ lang, categories }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlQuery = searchParams.get("q") ?? "";
  const sortValue = searchParams.get("sort") ?? "";
  const activeCategory = searchParams.get("category") ?? "";

  const [query, setQuery] = React.useState(urlQuery);
  const [sortOpen, setSortOpen] = React.useState(false);
  const sortRef = React.useRef<HTMLDivElement>(null);

  // Keep the input in sync when the URL changes from elsewhere (e.g. "Clear filters")
  React.useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  // Close sort dropdown on outside click
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Every filter change goes back to page 1
  const updateParams = React.useCallback(
    (updates: Record<string, string | null>, replace = false) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      params.delete("page");

      const qs = params.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (replace) router.replace(url, { scroll: false });
      else router.push(url, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // Search as you type (debounced)
  React.useEffect(() => {
    if (query.trim() === urlQuery) return;
    const id = setTimeout(
      () => updateParams({ q: query.trim() || null }, true),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(id);
  }, [query, urlQuery, updateParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: query.trim() || null }, true);
  };

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortValue)?.label[lang] ??
    UI.sortBy[lang];

  const chips: FilterCategory[] = [
    { id: "", label: UI.all[lang] },
    ...categories,
  ];

  return (
    <div className="w-full border-b border-[#e3e8df] bg-white">
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
        {/* Search + Sort row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute inset-s-3.5 top-1/2 -translate-y-1/2 text-[#9aa596]"
            />

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={UI.search[lang]}
              aria-label={UI.search[lang]}
              className="w-full rounded-lg border border-[#dfe5da] bg-[#f8faf5] py-2.5 ps-10 pe-9 text-sm text-[#252525] outline-none transition placeholder:text-[#9aa596] focus:border-[#438c35] focus:bg-white focus:ring-2 focus:ring-[#438c35]/15"
            />

            {query && (
              <button
                type="button"
                aria-label={UI.clearSearch[lang]}
                onClick={() => {
                  setQuery("");
                  updateParams({ q: null }, true);
                }}
                className="absolute inset-e-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center text-[#9aa596] hover:text-[#555]"
              >
                <X size={15} />
              </button>
            )}
          </form>

          {/* Sort */}
          <div ref={sortRef} className="relative shrink-0">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
              onClick={() => setSortOpen((o) => !o)}
              className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition sm:w-auto ${
                sortValue
                  ? "border-[#438c35] bg-[#e7f2dc] text-[#438c35]"
                  : "border-[#dfe5da] bg-[#f8faf5] text-[#444] hover:border-[#438c35]/50"
              }`}
            >
              <ArrowUpDown size={15} />
              {activeSortLabel}
            </button>

            {sortOpen && (
              <div
                role="listbox"
                className="absolute inset-e-0 z-20 mt-2 w-56 overflow-hidden rounded-lg border border-[#e3e8df] bg-white py-1 shadow-lg"
              >
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value || "newest"}
                    type="button"
                    role="option"
                    aria-selected={sortValue === option.value}
                    onClick={() => {
                      updateParams({ sort: option.value || null });
                      setSortOpen(false);
                    }}
                    className={`block w-full cursor-pointer px-4 py-2.5 text-start text-sm transition hover:bg-[#f8faf5] ${
                      sortValue === option.value
                        ? "font-semibold text-[#438c35]"
                        : "text-[#444]"
                    }`}
                  >
                    {option.label[lang]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category chips */}
        {categories.length > 0 && (
          <div
            role="tablist"
            aria-label={UI.categories[lang]}
            className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
          >
            {chips.map((category) => {
              const isActive = activeCategory === category.id;

              return (
                <button
                  key={category.id || "all"}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => updateParams({ category: category.id || null })}
                  className={`shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold transition ${
                    isActive
                      ? "border-[#438c35] bg-[#438c35] text-white"
                      : "border-[#dfe5da] bg-white text-[#555] hover:border-[#438c35] hover:text-[#438c35]"
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Filter;