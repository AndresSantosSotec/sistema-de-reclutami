import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

/**
 * Hook para manejar el tema oscuro/claro de la aplicación
 * Aplica el tema tanto con clase .dark como con data-appearance para compatibilidad
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Leer del localStorage o usar preferencia del sistema
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved && (saved === 'light' || saved === 'dark')) {
      return saved
    }
    
    // Detectar preferencia del sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  })

  // Función para aplicar el tema al DOM
  const applyThemeToDOM = (themeToApply: Theme) => {
    const root = document.documentElement
    const body = document.body
    
    if (themeToApply === 'dark') {
      root.classList.add('dark')
      root.setAttribute('data-appearance', 'dark')
      root.setAttribute('data-theme', 'dark')
      root.style.colorScheme = 'dark'
      body?.classList.add('dark')
    } else {
      root.classList.remove('dark')
      root.setAttribute('data-appearance', 'light')
      root.setAttribute('data-theme', 'light')
      root.style.colorScheme = 'light'
      body?.classList.remove('dark')
    }
    
    // Guardar en localStorage
    localStorage.setItem('theme', themeToApply)
    
    // Forzar re-render de estilos
    root.style.setProperty('--theme-applied', themeToApply)
  }

  // Aplicar tema cuando cambia el estado
  useEffect(() => {
    applyThemeToDOM(theme)
  }, [theme])

  // Aplicar tema inmediatamente al montar (por si acaso)
  useEffect(() => {
    applyThemeToDOM(theme)
    
    // Escuchar cambios en la preferencia del sistema (solo si no hay tema guardado)
    if (!localStorage.getItem('theme')) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem('theme')) {
          const newTheme = e.matches ? 'dark' : 'light'
          setTheme(newTheme)
        }
      }
      
      // Compatibilidad con navegadores antiguos
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
      } else {
        // Fallback para navegadores antiguos
        mediaQuery.addListener(handleChange)
        return () => mediaQuery.removeListener(handleChange)
      }
    }
  }, [])

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light'
      applyThemeToDOM(newTheme)
      return newTheme
    })
  }

  return { theme, toggleTheme, setTheme }
}

