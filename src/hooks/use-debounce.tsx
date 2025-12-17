import { useRef } from 'react'
import { useEffect } from 'react'

/**
 *
 * @param effect effect function
 * @param deps dependencies
 * @param delay delay time
 * @returns void
 * @example
 * useDebouncedEffect(() => {
 *   console.log('debounced effect')
 * }, [deps], 500)
 */
export function useDebouncedEffect(
  effect: () => void | (() => void),
  deps: any[],
  delay = 500
) {
  const isFirstMount = useRef(true)

  useEffect(() => {
    // Initial load executes immediately
    if (isFirstMount.current) {
      isFirstMount.current = false
      effect()
      return
    }
    const timer = setTimeout(() => {
      effect()
    }, delay)

    return () => {
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay])
}
