import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Envelope, 
  Phone, 
  LinkedinLogo, 
  MagnifyingGlass, 
  Briefcase, 
  GraduationCap, 
  Star, 
  MapPin, 
  DownloadSimple,
  BriefcaseMetal,
  FilePdf,
  FileXls,
  StarFour,
  Brain,
  Clipboard,
  Globe,
  FileText,
  Calendar
} from '@phosphor-icons/react'
import { useCandidates } from '@/hooks/useCandidates'
import { adminCandidateService, type AdminCandidateDetail } from '@/lib/adminCandidateService'
import { talentBankService } from '@/lib/talentBankService'

export function Candidates() {
  const { candidates, loading, fetchCandidates, exportCandidates } = useCandidates()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null)
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<AdminCandidateDetail | null>(null)
  const [isInTalentBank, setIsInTalentBank] = useState(false)
  const [addingToTalentBank, setAddingToTalentBank] = useState(false)

  useEffect(() => {
    fetchCandidates({})
  }, [fetchCandidates])

  const filteredCandidates = candidates.filter(candidate => {
    const search = searchTerm.toLowerCase()
    return (
      candidate.name.toLowerCase().includes(search) ||
      candidate.email.toLowerCase().includes(search) ||
      (candidate.phone && candidate.phone.toLowerCase().includes(search))
    )
  })

  const handleViewDetails = async (candidateId: string) => {
    const candidateIdNum = parseInt(candidateId)
    setSelectedCandidateId(candidateIdNum)
    setSelectedCandidateDetail(null)
    setIsInTalentBank(false)
    
    try {
      const [detail, inTalentBank] = await Promise.all([
        adminCandidateService.getCandidateDetail(candidateIdNum),
        talentBankService.checkCandidate(candidateIdNum)
      ])
      setSelectedCandidateDetail(detail)
      setIsInTalentBank(inTalentBank)
    } catch (error) {
      console.error('Error al cargar detalle del candidato:', error)
      toast.error('Error al cargar la información del candidato')
      setSelectedCandidateId(null)
    }
  }

  const handleAddToTalentBank = async () => {
    if (!selectedCandidateId) return
    
    setAddingToTalentBank(true)
    try {
      await talentBankService.add({
        id_postulante: selectedCandidateId,
        prioridad: 'media'
      })
      setIsInTalentBank(true)
      toast.success('Candidato agregado al Banco de Talento')
    } catch (error: any) {
      console.error('Error al agregar al banco de talento:', error)
      if (error.response?.status === 422) {
        toast.error('Este candidato ya está en el Banco de Talento')
      } else {
        toast.error('Error al agregar al Banco de Talento')
      }
    } finally {
      setAddingToTalentBank(false)
    }
  }

  const handleExport = () => {
    exportCandidates({ search: searchTerm })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Cargando candidatos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Candidatos</h1>
        <p className="text-muted-foreground mt-2">
          Base de datos de todos los candidatos
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Todos los Candidatos</CardTitle>
              <CardDescription>
                {filteredCandidates.length} de {candidates.length} candidato{candidates.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar candidatos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Button onClick={handleExport} variant="outline" className="gap-2">
                <FileXls size={18} />
                Excel
              </Button>
              <Button onClick={handleExport} variant="outline" className="gap-2">
                <FilePdf size={18} />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCandidates.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                {candidates.length === 0 
                  ? 'No hay candidatos registrados aún.' 
                  : 'No se encontraron candidatos con ese criterio de búsqueda.'}
              </div>
            ) : (
              filteredCandidates.map(candidate => (
                <Card 
                  key={candidate.id} 
                  className="hover:shadow-lg transition-all cursor-pointer hover:border-primary/50" 
                  onClick={() => handleViewDetails(candidate.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                        {candidate.avatar ? (
                          <img 
                            src={candidate.avatar} 
                            alt={candidate.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <User size={32} weight="duotone" className="text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate text-lg">{candidate.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{candidate.email}</p>
                        {candidate.phone && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <MapPin size={12} />
                            <span className="truncate">{candidate.phone}</span>
                          </div>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {candidate.skills?.length || 0} skill{(candidate.skills?.length || 0) !== 1 ? 's' : ''}
                          </Badge>
                          {candidate.workExperience && candidate.workExperience.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <Star size={12} className="mr-1" />
                              {candidate.workExperience.length} experiencia{candidate.workExperience.length !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!selectedCandidateId} onOpenChange={(open) => !open && setSelectedCandidateId(null)}>
        <SheetContent className="sm:max-w-2xl w-full p-0">
          <ScrollArea className="h-full">
            <div className="p-6">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-2xl">Perfil del Candidato</SheetTitle>
                <SheetDescription>
                  Información completa del candidato y sus postulaciones
                </SheetDescription>
              </SheetHeader>
              
              {!selectedCandidateDetail ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">Cargando información del candidato...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Header con foto y datos básicos */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                          {selectedCandidateDetail.foto_perfil ? (
                            <img 
                              src={selectedCandidateDetail.foto_perfil} 
                              alt={selectedCandidateDetail.nombre}
                              className="w-20 h-20 rounded-full object-cover"
                            />
                          ) : (
                            <User size={40} weight="duotone" className="text-primary" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <h3 className="text-2xl font-bold">{selectedCandidateDetail.nombre}</h3>
                          {selectedCandidateDetail.profesion && (
                            <p className="text-lg text-muted-foreground">{selectedCandidateDetail.profesion}</p>
                          )}
                          {selectedCandidateDetail.ubicacion && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin size={16} />
                              <span>{selectedCandidateDetail.ubicacion}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Información de contacto */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Envelope size={20} />
                        Información de Contacto
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Envelope size={18} className="text-muted-foreground" />
                        <span>{selectedCandidateDetail.email}</span>
                      </div>
                      {selectedCandidateDetail.telefono && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone size={18} className="text-muted-foreground" />
                          <span>{selectedCandidateDetail.telefono}</span>
                        </div>
                      )}
                      {selectedCandidateDetail.linkedin && (
                        <div className="flex items-center gap-3 text-sm">
                          <LinkedinLogo size={18} className="text-muted-foreground" />
                          <a 
                            href={selectedCandidateDetail.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:underline"
                          >
                            Ver perfil de LinkedIn
                          </a>
                        </div>
                      )}
                      {selectedCandidateDetail.portfolio && (
                        <div className="flex items-center gap-3 text-sm">
                          <Globe size={18} className="text-muted-foreground" />
                          <a 
                            href={selectedCandidateDetail.portfolio} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:underline"
                          >
                            Ver portafolio
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Botón de Banco de Talento */}
                  <Button 
                    onClick={handleAddToTalentBank}
                    disabled={isInTalentBank || addingToTalentBank}
                    className="w-full gap-2"
                    variant={isInTalentBank ? "outline" : "default"}
                  >
                    <StarFour size={18} weight={isInTalentBank ? "fill" : "regular"} />
                    {isInTalentBank ? 'Ya está en el Banco de Talento' : 'Agregar al Banco de Talento'}
                  </Button>

                  <Separator />

                  {/* Biografía */}
                  {selectedCandidateDetail.bio && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText size={20} />
                          Acerca de
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selectedCandidateDetail.bio}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Experiencia Laboral */}
                  {selectedCandidateDetail.experiencia && selectedCandidateDetail.experiencia.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Briefcase size={20} />
                          Experiencia Laboral
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedCandidateDetail.experiencia.map((exp, index) => (
                          <div key={index} className="border-l-2 border-primary/20 pl-4 space-y-1">
                            <h4 className="font-semibold">{exp.puesto}</h4>
                            <p className="text-sm text-primary">{exp.empresa}</p>
                            <p className="text-xs text-muted-foreground">
                              {exp.fecha_inicio} - {exp.actualmente_trabajando ? 'Presente' : exp.fecha_fin}
                            </p>
                            {exp.descripcion && (
                              <p className="text-sm text-muted-foreground pt-2">{exp.descripcion}</p>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Educación */}
                  {selectedCandidateDetail.educacion && selectedCandidateDetail.educacion.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <GraduationCap size={20} />
                          Educación
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedCandidateDetail.educacion.map((edu, index) => (
                          <div key={index} className="border-l-2 border-primary/20 pl-4 space-y-1">
                            <h4 className="font-semibold">{edu.titulo}</h4>
                            <p className="text-sm text-primary">{edu.institucion}</p>
                            <p className="text-xs text-muted-foreground">
                              {edu.nivel} • {edu.fecha_inicio} - {edu.en_curso ? 'En curso' : edu.fecha_fin}
                            </p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Habilidades */}
                  {selectedCandidateDetail.habilidades && selectedCandidateDetail.habilidades.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Star size={20} />
                          Habilidades
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {selectedCandidateDetail.habilidades.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="px-3 py-1">
                              <span className="font-medium">{skill.nombre}</span>
                              {skill.nivel && (
                                <span className="ml-2 text-xs text-muted-foreground">• {skill.nivel}</span>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Separator />

                  {/* CV */}
                  {selectedCandidateDetail.cvs && selectedCandidateDetail.cvs.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText size={20} />
                          Currículum Vitae
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{selectedCandidateDetail.cvs[0].nombre_archivo}</p>
                            <p className="text-xs text-muted-foreground">
                              Subido el {new Date(selectedCandidateDetail.cvs[0].fecha_subida).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(selectedCandidateDetail.cvs![0].url, '_blank')}
                          >
                            <DownloadSimple size={16} className="mr-2" />
                            Descargar CV
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Tabs de Postulaciones */}
                  <Tabs defaultValue="postulaciones" className="mt-6">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="postulaciones">
                        <Briefcase size={16} className="mr-2" />
                        Postulaciones
                      </TabsTrigger>
                      <TabsTrigger value="evaluaciones">
                        <Clipboard size={16} className="mr-2" />
                        Evaluaciones
                      </TabsTrigger>
                      <TabsTrigger value="ia">
                        <Brain size={16} className="mr-2" />
                        IA
                      </TabsTrigger>
                      <TabsTrigger value="psicometricas">
                        <Star size={16} className="mr-2" />
                        Psicométricas
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="postulaciones" className="space-y-4">
                      {selectedCandidateDetail.postulaciones.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No hay postulaciones registradas
                        </div>
                      ) : (
                        <ScrollArea className="h-[400px] pr-4">
                          <div className="space-y-3">
                            {selectedCandidateDetail.postulaciones.map(post => (
                              <Card key={post.id}>
                                <CardContent className="pt-4">
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="font-semibold text-lg">{post.oferta?.titulo || 'Oferta sin título'}</h4>
                                        <p className="text-sm text-muted-foreground">{post.oferta?.empresa || 'COOSANJER'}</p>
                                      </div>
                                      <Badge variant="outline">
                                        {post.estado}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Calendar size={16} />
                                      <span>Aplicó el {new Date(post.fecha_postulacion).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}</span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </TabsContent>

                    <TabsContent value="evaluaciones" className="space-y-4">
                      <div className="text-center py-12">
                        <Clipboard size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
                        <p className="text-muted-foreground">
                          No hay evaluaciones registradas para este candidato
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Las evaluaciones de entrevistas y procesos aparecerán aquí
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="ia" className="space-y-4">
                      <div className="text-center py-12">
                        <Brain size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
                        <p className="text-muted-foreground">
                          Análisis con IA no disponible
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Analiza el perfil del candidato con inteligencia artificial
                        </p>
                        <Button className="mt-4" variant="outline">
                          <Brain size={18} className="mr-2" />
                          Analizar Candidato
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="psicometricas" className="space-y-4">
                      <div className="text-center py-12">
                        <Star size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
                        <p className="text-muted-foreground">
                          No se han enviado pruebas psicométricas
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Envía pruebas psicométricas externas al candidato
                        </p>
                        <Button className="mt-4" variant="outline">
                          <Star size={18} className="mr-2" />
                          Enviar Prueba
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )
}
