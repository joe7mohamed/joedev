import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface Modal {
  id: string;
  type: 'confirm' | 'info' | 'form';
  title: string;
  content?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  data?: Record<string, unknown>;
}

interface UIState {
  // Global loading states
  globalLoading: boolean;
  
  // Toast notifications
  toasts: Toast[];
  
  // Modals
  modals: Modal[];
  
  // Mobile navigation
  mobileMenuOpen: boolean;
  
  // Sidebar state (for admin)
  sidebarCollapsed: boolean;
  
  // Page transitions
  pageTransitioning: boolean;
  
  // Form states
  forms: {
    contact: {
      isDirty: boolean;
      isSubmitting: boolean;
      errors: Record<string, string>;
    };
    booking: {
      isDirty: boolean;
      isSubmitting: boolean;
      errors: Record<string, string>;
    };
  };
  
  // Performance monitoring
  performance: {
    lastRenderTime: number | null;
    slowRenders: number;
  };
}

const initialState: UIState = {
  globalLoading: false,
  toasts: [],
  modals: [],
  mobileMenuOpen: false,
  sidebarCollapsed: false,
  pageTransitioning: false,
  forms: {
    contact: {
      isDirty: false,
      isSubmitting: false,
      errors: {},
    },
    booking: {
      isDirty: false,
      isSubmitting: false,
      errors: {},
    },
  },
  performance: {
    lastRenderTime: null,
    slowRenders: 0,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Global loading
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    
    // Toast management
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      const toast: Toast = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };
      state.toasts.push(toast);
    },
    
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    
    clearToasts: (state) => {
      state.toasts = [];
    },
    
    // Modal management
    openModal: (state, action: PayloadAction<Omit<Modal, 'id'>>) => {
      const modal: Modal = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.modals.push(modal);
    },
    
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals = state.modals.filter(modal => modal.id !== action.payload);
    },
    
    closeAllModals: (state) => {
      state.modals = [];
    },
    
    // Mobile menu
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
    
    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    
    // Page transitions
    setPageTransitioning: (state, action: PayloadAction<boolean>) => {
      state.pageTransitioning = action.payload;
    },
    
    // Form states
    setFormDirty: (state, action: PayloadAction<{ form: keyof UIState['forms']; isDirty: boolean }>) => {
      const { form, isDirty } = action.payload;
      state.forms[form].isDirty = isDirty;
    },
    
    setFormSubmitting: (state, action: PayloadAction<{ form: keyof UIState['forms']; isSubmitting: boolean }>) => {
      const { form, isSubmitting } = action.payload;
      state.forms[form].isSubmitting = isSubmitting;
    },
    
    setFormErrors: (state, action: PayloadAction<{ form: keyof UIState['forms']; errors: Record<string, string> }>) => {
      const { form, errors } = action.payload;
      state.forms[form].errors = errors;
    },
    
    clearFormErrors: (state, action: PayloadAction<keyof UIState['forms']>) => {
      state.forms[action.payload].errors = {};
    },
    
    resetForm: (state, action: PayloadAction<keyof UIState['forms']>) => {
      state.forms[action.payload] = {
        isDirty: false,
        isSubmitting: false,
        errors: {},
      };
    },
    
    // Performance monitoring
    recordRenderTime: (state, action: PayloadAction<number>) => {
      state.performance.lastRenderTime = action.payload;
      if (action.payload > 16) { // 60fps threshold
        state.performance.slowRenders += 1;
      }
    },
    
    resetPerformanceStats: (state) => {
      state.performance = {
        lastRenderTime: null,
        slowRenders: 0,
      };
    },
  },
});

export const {
  setGlobalLoading,
  addToast,
  removeToast,
  clearToasts,
  openModal,
  closeModal,
  closeAllModals,
  toggleMobileMenu,
  setMobileMenuOpen,
  toggleSidebar,
  setSidebarCollapsed,
  setPageTransitioning,
  setFormDirty,
  setFormSubmitting,
  setFormErrors,
  clearFormErrors,
  resetForm,
  recordRenderTime,
  resetPerformanceStats,
} = uiSlice.actions;

// Selectors
export const selectGlobalLoading = (state: { ui: UIState }) => state.ui.globalLoading;
export const selectToasts = (state: { ui: UIState }) => state.ui.toasts;
export const selectModals = (state: { ui: UIState }) => state.ui.modals;
export const selectMobileMenuOpen = (state: { ui: UIState }) => state.ui.mobileMenuOpen;
export const selectSidebarCollapsed = (state: { ui: UIState }) => state.ui.sidebarCollapsed;
export const selectPageTransitioning = (state: { ui: UIState }) => state.ui.pageTransitioning;
export const selectFormState = (state: { ui: UIState }, form: keyof UIState['forms']) => state.ui.forms[form];
export const selectPerformanceStats = (state: { ui: UIState }) => state.ui.performance;

export default uiSlice.reducer;