import { create } from 'zustand'

interface Global404State {
  isOpen: boolean
  message: string | null
  url: string | null
  openTimestamp: number | null // 添加时间戳
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

    // 如果已经打开，且距离上次打开不到 1 秒，只更新消息
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

    // 第一次打开或超过 1 秒后重新打开
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
