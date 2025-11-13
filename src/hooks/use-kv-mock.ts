/**
 * Mock implementation of Spark's useKV hook
 * Uses localStorage instead of Spark KV backend
 */
import { useState } from 'react'

export function useKV<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const storageKey = `kv_${key}`
  
  // Get initial value from localStorage or use default
  const getStoredValue = (): T => {
    try {
      const item = localStorage.getItem(storageKey)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  }

  const [value, setValue] = useState<T>(getStoredValue)

  // Update function that supports both direct values and updater functions
  const updateValue = (newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(value)
        : newValue
      
      localStorage.setItem(storageKey, JSON.stringify(valueToStore))
      setValue(valueToStore)
    } catch (error) {
      console.warn(`Failed to save to localStorage: ${key}`, error)
    }
  }

  return [value, updateValue]
}

// Re-export for compatibility
export { useKV as default }
