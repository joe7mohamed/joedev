import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { emailService, type ContactFormData } from '../../services/emailService';

interface AppState {
  isLoading: boolean;
  error: string | null;
  portfolioData: Record<string, unknown> | null;
  contactFormData: ContactFormData | null;
  hasLoadedInitially: boolean;
  contactSubmissionStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  contactSubmissionMessage: string;
}

const initialState: AppState = {
  isLoading: true,
  error: null,
  portfolioData: null,
  contactFormData: null,
  hasLoadedInitially: false,
  contactSubmissionStatus: 'idle',
  contactSubmissionMessage: '',
};

// Async thunk for email submission
export const submitContactForm = createAsyncThunk(
  'app/submitContactForm',
  async (contactData: ContactFormData) => {
    const response = await emailService.sendContactEmail(contactData);
    return response;
  }
);

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setPortfolioData: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.portfolioData = action.payload;
    },
    setContactFormData: (state, action: PayloadAction<ContactFormData>) => {
      state.contactFormData = action.payload;
    },
    setHasLoadedInitially: (state, action: PayloadAction<boolean>) => {
      state.hasLoadedInitially = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetContactSubmissionStatus: (state) => {
      state.contactSubmissionStatus = 'idle';
      state.contactSubmissionMessage = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit contact form
      .addCase(submitContactForm.pending, (state) => {
        state.contactSubmissionStatus = 'loading';
        state.error = null;
        state.contactSubmissionMessage = '';
      })
      .addCase(submitContactForm.fulfilled, (state, action) => {
        state.contactSubmissionStatus = action.payload.success ? 'succeeded' : 'failed';
        state.contactSubmissionMessage = action.payload.message;
        if (!action.payload.success) {
          state.error = action.payload.message;
        }
      })
      .addCase(submitContactForm.rejected, (state, action) => {
        state.contactSubmissionStatus = 'failed';
        state.error = action.error.message || 'Failed to submit contact form';
        state.contactSubmissionMessage = 'Failed to send your message. Please try again.';
      });
  },
});

export const {
  setLoading,
  setError,
  setPortfolioData,
  setContactFormData,
  setHasLoadedInitially,
  clearError,
  resetContactSubmissionStatus,
} = appSlice.actions;

export type { ContactFormData };

export default appSlice.reducer;