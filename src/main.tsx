import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from 'sonner'
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

// Silenciar errores de Spark en desarrollo (son normales en el entorno Spark)
if (import.meta.env.DEV) {
  // Interceptar fetch para silenciar errores de Spark
  const originalFetch = window.fetch
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url
    if (url && (url.includes('_spark/loaded') || url.includes('localhost:5001'))) {
      // Retornar una respuesta vacía para Spark
      return Promise.resolve(new Response(null, { status: 200 }))
    }
    return originalFetch.apply(this, [input, init])
  }

  // Interceptar XMLHttpRequest para silenciar errores de Spark
  const originalXHROpen = XMLHttpRequest.prototype.open
  const originalXHRSend = XMLHttpRequest.prototype.send
  
  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...rest: any[]) {
    const urlStr = typeof url === 'string' ? url : url.toString()
    if (urlStr.includes('_spark/loaded') || urlStr.includes('localhost:5001')) {
      // Marcar esta request como Spark para ignorarla después
      ;(this as any)._isSparkRequest = true
    }
    return originalXHROpen.apply(this, [method, url, ...rest])
  }

  XMLHttpRequest.prototype.send = function(...args: any[]) {
    if ((this as any)._isSparkRequest) {
      // Para requests de Spark, simular éxito
      setTimeout(() => {
        Object.defineProperty(this, 'status', { value: 200, writable: false })
        Object.defineProperty(this, 'readyState', { value: 4, writable: false })
        if (this.onload) this.onload(new Event('load') as any)
      }, 0)
      return
    }
    this.addEventListener('loadend', function() {
      if (this.status === 401) {
        const url = this.responseURL || ''
        if (url.includes('_spark/loaded') || url.includes('localhost:5001')) {
          // Silenciar error 401 de Spark
          return
        }
      }
    })
    return originalXHRSend.apply(this, args)
  }

  // Interceptar console.error para errores de Spark
  const originalError = console.error
  console.error = (...args: any[]) => {
    const errorString = String(args[0] || '')
    const allArgsString = args.map(arg => String(arg)).join(' ')
    
    // Ignorar cualquier error relacionado con Spark
    if (errorString.includes('_spark/loaded') || 
        errorString.includes('localhost:5001') ||
        errorString.includes('spark.ts') ||
        allArgsString.includes('_spark/loaded') ||
        allArgsString.includes('localhost:5001') ||
        allArgsString.includes('spark.ts')) {
      return
    }
    originalError.apply(console, args)
  }
  
  // Interceptar errores no capturados de Spark
  window.addEventListener('error', (event) => {
    if (event.message && 
        (event.message.includes('_spark/loaded') || 
         event.message.includes('localhost:5001') ||
         event.message.includes('spark.ts'))) {
      event.preventDefault()
      event.stopPropagation()
      return false
    }
  }, true)
  
  // Interceptar promesas rechazadas de Spark
  window.addEventListener('unhandledrejection', (event) => {
    const reason = String(event.reason || '')
    if (reason.includes('_spark/loaded') || 
        reason.includes('localhost:5001') ||
        reason.includes('spark')) {
      event.preventDefault()
      return false
    }
  })
}

// Aplicar tema antes de renderizar (backup por si el script inline no se ejecutó)
const applyInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  const theme = savedTheme || (prefersDark ? 'dark' : 'light')
  const root = document.documentElement
  
  if (theme === 'dark') {
    root.classList.add('dark')
    root.setAttribute('data-appearance', 'dark')
    root.setAttribute('data-theme', 'dark')
    root.style.colorScheme = 'dark'
  } else {
    root.classList.remove('dark')
    root.setAttribute('data-appearance', 'light')
    root.setAttribute('data-theme', 'light')
    root.style.colorScheme = 'light'
  }
}

// Aplicar tema inmediatamente (backup)
applyInitialTheme()

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
    <Toaster position="top-right" richColors closeButton />
   </ErrorBoundary>
)
