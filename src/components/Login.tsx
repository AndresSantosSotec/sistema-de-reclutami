import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Briefcase, Eye, EyeSlash, EnvelopeSimple } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface LoginProps {
  onLogin: (email: string, userId: string) => void
}

interface UserAccount {
  id: string
  email: string
  password: string
  name: string
  createdAt: string
}

export function Login({ onLogin }: LoginProps) {
  const [users, setUsers] = useKV<UserAccount[]>('user-accounts', [
    {
      id: 'default-admin',
      email: 'admin@coosajer.com',
      password: 'admin123',
      name: 'Administrador',
      createdAt: new Date().toISOString()
    }
  ])

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Por favor completa todos los campos')
      return
    }

    setIsLoading(true)
    
    setTimeout(() => {
      const user = (users || []).find(u => u.email.toLowerCase() === email.toLowerCase())
      
      if (user && user.password === password) {
        onLogin(email, user.id)
        toast.success(`Bienvenido, ${user.name}`)
      } else {
        toast.error('Credenciales inválidas')
        setIsLoading(false)
      }
    }, 800)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password || !name || !confirmPassword) {
      toast.error('Por favor completa todos los campos')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      const existingUser = (users || []).find(u => u.email.toLowerCase() === email.toLowerCase())
      
      if (existingUser) {
        toast.error('Ya existe una cuenta con este correo electrónico')
        setIsLoading(false)
        return
      }

      const newUser: UserAccount = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email: email.toLowerCase(),
        password,
        name,
        createdAt: new Date().toISOString()
      }

      setUsers(current => [...(current || []), newUser])
      toast.success('Cuenta creada exitosamente')
      setMode('login')
      setPassword('')
      setConfirmPassword('')
      setName('')
      setIsLoading(false)
    }, 800)
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Por favor ingresa tu correo electrónico')
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      const user = (users || []).find(u => u.email.toLowerCase() === email.toLowerCase())
      
      if (user) {
        toast.success('Se ha enviado un enlace de recuperación a tu correo electrónico', {
          description: `En modo demo, tu contraseña es: ${user.password}`
        })
      } else {
        toast.error('No se encontró una cuenta con este correo electrónico')
      }
      setIsLoading(false)
    }, 800)
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
            <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="login">Ingresar</TabsTrigger>
                <TabsTrigger value="register">Registrar</TabsTrigger>
                <TabsTrigger value="forgot">Recuperar</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Correo Electrónico</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="tu@email.com"
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
              </TabsContent>

              <TabsContent value="register" className="space-y-4 mt-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nombre Completo</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Tu nombre"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                      autoComplete="name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Correo Electrónico</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Repite tu contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="forgot" className="space-y-4 mt-6">
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Correo Electrónico</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      autoComplete="email"
                    />
                    <p className="text-xs text-muted-foreground">
                      Te enviaremos un enlace para restablecer tu contraseña
                    </p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Enviando...' : (
                      <>
                        <EnvelopeSimple className="mr-2" />
                        Enviar Enlace de Recuperación
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {mode === 'login' && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground border border-border/50">
                <p className="font-medium mb-1">Credenciales de prueba:</p>
                <p>Email: admin@coosajer.com</p>
                <p>Contraseña: admin123</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
