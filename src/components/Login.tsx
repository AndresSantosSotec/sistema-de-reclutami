import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Eye, EyeSlash } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { adminAuthService } from '@/lib/adminAuthService'

interface LoginProps {
  onLogin: (email: string, userId: string) => void
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🔐 [Admin Login] Iniciando autenticación de administrador...')
    console.log('📧 Email:', email)
    console.log('🔑 Password length:', password.length)
    
    if (!email || !password) {
      toast.error('Por favor completa todos los campos')
      return
    }

    setIsLoading(true)
    
    try {
      console.log('🔄 [Admin Login] Enviando petición de login...')
      const response = await adminAuthService.login({
        email: email,
        password: password,
        user_type: 'admin'
      })
      
      console.log('✅ [Admin Login] Respuesta recibida:', response)
      console.log('👤 Usuario:', response.user)
      console.log('🎫 Token guardado:', !!localStorage.getItem('admin_token'))
      console.log('🔒 User type:', response.user?.user_type)
      
      if (!response.user) {
        throw new Error('No se recibió información del usuario')
      }
      
      if (response.user.user_type !== 'admin') {
        throw new Error('Solo administradores pueden acceder a este panel')
      }
      
      onLogin(email, response.user.id.toString())
      toast.success(`Bienvenido, ${response.user.name}`)
      console.log('🎉 [Admin Login] Login exitoso')
    } catch (error: any) {
      console.error('❌ [Admin Login] Error:', error)
      console.error('📄 Error completo:', error.response?.data)
      
      const errorMessage = error.message || 'Credenciales inválidas'
      toast.error(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-border/50">
          <CardHeader className="space-y-4 text-center pb-6">
            <motion.div 
              className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Briefcase size={36} weight="duotone" className="text-primary-foreground" />
            </motion.div>
            <div>
              <CardTitle className="text-3xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Coosajer Empleos
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Panel Administrativo de Reclutamiento
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="login-email">Correo Electrónico</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="admin@coosajer.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </Button>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? 'Validando...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
