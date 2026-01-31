import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Business, UserRole, PaymentIntent } from "@/types";

interface AppState {
  // User state
  userRole: UserRole | null;
  setUserRole: (role: UserRole | null) => void;

  // Business state
  currentBusiness: Business | null;
  setCurrentBusiness: (business: Business | null) => void;

  // Onboarding state
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;

  // Payment state
  currentPayment: PaymentIntent | null;
  setCurrentPayment: (payment: PaymentIntent | null) => void;

  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Directory filters
  directoryFilters: {
    category: string | null;
    search: string;
    sortBy: "rating" | "distance" | "name";
  };
  setDirectoryFilters: (
    filters: Partial<AppState["directoryFilters"]>
  ) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  userRole: null,
  currentBusiness: null,
  onboardingStep: 1,
  currentPayment: null,
  sidebarOpen: true,
  directoryFilters: {
    category: null,
    search: "",
    sortBy: "rating" as const,
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      setUserRole: (role) => set({ userRole: role }),
      setCurrentBusiness: (business) => set({ currentBusiness: business }),
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      setCurrentPayment: (payment) => set({ currentPayment: payment }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setDirectoryFilters: (filters) =>
        set((state) => ({
          directoryFilters: { ...state.directoryFilters, ...filters },
        })),
      reset: () => set(initialState),
    }),
    {
      name: "durian-storage",
      partialize: (state) => ({
        userRole: state.userRole,
        onboardingStep: state.onboardingStep,
        directoryFilters: state.directoryFilters,
      }),
    }
  )
);
