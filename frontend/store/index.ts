import { configureStore } from "@reduxjs/toolkit";
import { homeBannerApi } from "./homeBannerApi";
import { counterApi } from "./counterApi";
import { categoryApi } from "./categoriesApi";
import { whyChooseUsApi } from "./whyChooseUsApi";
import { aboutUsApi } from "./aboutUsApi";
import { howToOrderApi } from "./howToOrderApi";
import { contactApi } from "./contactApi";
import { settingApi } from "./settingApi";
import { faqApi } from "./faqApi";
import { termsApi } from "./termsApi";
import { privacyApi } from "./privacyPolicyApi";
import { productsApi } from "./productsApi";
import ProductEnquiryApi from "./productEnquiriesApi";

export const store = configureStore({
  reducer: {
    homeBannerApi: homeBannerApi.reducer,
    counterApi: counterApi.reducer,
    categoryApi: categoryApi.reducer,
    whyChooseUsApi: whyChooseUsApi.reducer,
    aboutUsApi: aboutUsApi.reducer,
    howToOrderApi: howToOrderApi.reducer,
    contactApi: contactApi.reducer,
    settingApi: settingApi.reducer,
    faqApi: faqApi.reducer,
    termsApi: termsApi.reducer,
    privacyApi: privacyApi.reducer,
    productsApi: productsApi.reducer,
    ProductEnquiryApi: ProductEnquiryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      homeBannerApi.middleware,
      counterApi.middleware,
      categoryApi.middleware,
      whyChooseUsApi.middleware,
      aboutUsApi.middleware,
      howToOrderApi.middleware,
      contactApi.middleware,
      settingApi.middleware,
      faqApi.middleware,
      termsApi.middleware,
      privacyApi.middleware,
      productsApi.middleware,
      ProductEnquiryApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
