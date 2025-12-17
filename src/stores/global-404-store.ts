import { create } from 'zustand'

interface Global404State {
  isOpen: boolean
  message: string | null
  url: string | null
  openTimestamp: number | null // Add timestamp
  open: (message?: string, url?: string) => void
  close: () => void
}

export const useGlobal404Store = create<Global404State>((set, get) => ({
  isOpen: false,
  message: null,
  url: null,
  openTimestamp: null,
  open: (message, url) => {
    const now = Date.now()
    const state = get()

    // If already opened，and less than 1 seconds since last opened，Only update messages
    if (
      state.isOpen &&
      state.openTimestamp &&
      now - state.openTimestamp < 1000
    ) {
      set({
        message: message || null,
        url: url || null,
      })
      return
    }

    // First open or reopen after 1 seconds
    set({
      isOpen: true,
      message: message || null,
      url: url || null,
      openTimestamp: now,
    })
  },
  close: () =>
    set({
      isOpen: false,
      message: null,
      url: null,
      openTimestamp: null,
    }),
}))
