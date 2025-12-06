import { useState, useEffect } from 'react'

/**
 * Hook para aplicar debounce a un valor
 * @param value - Valor a debounced
 * @param delay - Tiempo de espera en ms (default: 500ms)
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
