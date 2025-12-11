/**
 * Sistema de logging que desactiva logs en producción
 */

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args)
    }
  },
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args)
    }
  },
  warn: (...args: any[]) => {
    // Los warnings siempre se muestran
    console.warn(...args)
  },
  error: (...args: any[]) => {
    // Los errores siempre se muestran
    console.error(...args)
  },
}

