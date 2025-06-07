import { configureStore } from '@reduxjs/toolkit';
import appSlice from './slices/appSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    app: appSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'ui/openModal',
          'ui/addToast',
        ],
        ignoredPaths: ['ui.modals', 'ui.toasts'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Enhanced typed hooks
export type TypedDispatch = typeof store.dispatch;