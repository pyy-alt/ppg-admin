import { create } from 'zustand'

interface LoadingState {
  pendingCount: number
  isLoading: boolean
  start: () => void
  end: () => void
}

export const useLoadingStore = create<LoadingState>((set) => ({
  pendingCount: 0,
  isLoading: false,
  start: () =>
    set((state) => {
      const next = state.pendingCount + 1
      return { pendingCount: next, isLoading: next > 0 }
    }),
  end: () =>
    set((state) => {
      const next = Math.max(0, state.pendingCount - 1)
      return { pendingCount: next, isLoading: next > 0 }
    }),
}))