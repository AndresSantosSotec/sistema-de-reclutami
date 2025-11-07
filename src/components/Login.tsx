import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface LoginProps {
  onLogin: (email: string) => void
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Por favor completa todos los campos')
      return
    }

    setIsLoading(true)
    
    setTimeout(() => {
      if (email === 'admin@coosajer.com' && password === 'admin123') {
        onLogin(email)
        toast.success('Bienvenido a Coosajer Empleos')
      } else {
        toast.error('Credenciales inválidas')
        setIsLoading(false)
      }
    }, 800)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-md shadow-2xl border-border/50">
          <CardHeader className="space-y-4 text-center pb-8">
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@coosajer.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="transition-all duration-200 focus:scale-[1.01]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="transition-all duration-200 focus:scale-[1.01]"
                />
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
            <div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground border border-border/50">
              <p className="font-medium mb-1">Credenciales de prueba:</p>
              <p>Email: admin@coosajer.com</p>
              <p>Contraseña: admin123</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
