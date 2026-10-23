import { configureStore } from '@reduxjs/toolkit'
import authSlice from './authSlice'
import { apiSlice } from './apiSlice'
import { settingApi } from './settingApi'
import { homeBannerApi } from './homeBanner'
import { aboutUsApi } from './aboutUsApi'
import { counterApi } from './counterApi'

import { faqApi } from './faqApi'

import { privacyApi } from './privacyPolicyApi'
import { contactApi } from './contactApi'

import { termsApi } from './termsApi'
import { productsApi } from './productsApi'

import { categoryApi } from './categoriesApi'
import ProductEnquiryApi from './productEnquiriesApi'
import { whyChooseUsApi } from './whyChooseUsApi'
import { howToOrderApi } from './howToOrderApi'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,

    [homeBannerApi.reducerPath]: homeBannerApi.reducer,
    [aboutUsApi.reducerPath]: aboutUsApi.reducer,
    [counterApi.reducerPath]: counterApi.reducer,
    [ProductEnquiryApi.reducerPath]: ProductEnquiryApi.reducer,
    [whyChooseUsApi.reducerPath]: whyChooseUsApi.reducer,
    [howToOrderApi.reducerPath]: howToOrderApi.reducer,

    [faqApi.reducerPath]: faqApi.reducer,

    [privacyApi.reducerPath]: privacyApi.reducer,

    [contactApi.reducerPath]: contactApi.reducer,

    [termsApi.reducerPath]: termsApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,

    [settingApi.reducerPath]: settingApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      apiSlice.middleware,
      categoryApi.middleware,
      homeBannerApi.middleware,
      ProductEnquiryApi.middleware,
      aboutUsApi.middleware,
      counterApi.middleware,
      faqApi.middleware,
      privacyApi.middleware,
      contactApi.middleware,
      termsApi.middleware,
      productsApi.middleware,
      settingApi.middleware,
      whyChooseUsApi.middleware,
      howToOrderApi.middleware,
    ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
