import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Users, MagnifyingGlass, EnvelopeSimple, Phone, Briefcase, GraduationCap, Star } from '@phosphor-icons/react'
import { formatDate } from '@/lib/constants'
import type { TalentBankCandidate, JobOffer } from '@/lib/types'

interface TalentBankProps {
  talentBankCandidates: TalentBankCandidate[]
  jobs: JobOffer[]
  onSuggestJob: (candidateId: string, jobId: string) => void
  onUpdateNotes: (candidateId: string, notes: string) => void
}

export function TalentBank({ talentBankCandidates, jobs, onSuggestJob, onUpdateNotes }: TalentBankProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState<TalentBankCandidate | null>(null)
  const [notes, setNotes] = useState('')

  const filteredCandidates = talentBankCandidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleOpenDialog = (candidate: TalentBankCandidate) => {
    setSelectedCandidate(candidate)
    setNotes(candidate.notes || '')
  }

  const handleSaveNotes = () => {
    if (selectedCandidate) {
      onUpdateNotes(selectedCandidate.id, notes)
      setSelectedCandidate(null)
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const activeJobs = jobs.filter(job => job.status === 'active')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Banco de Talento</h1>
          <p className="text-muted-foreground mt-1">
            Candidatos destacados guardados para futuras oportunidades
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {talentBankCandidates.length} candidatos
        </Badge>
      </div>

      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <Input
          placeholder="Buscar por nombre, correo o habilidades..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-lg transition-all cursor-pointer" onClick={() => handleOpenDialog(candidate)}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={candidate.photoUrl} alt={candidate.name} />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {getInitials(candidate.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{candidate.name}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <EnvelopeSimple size={14} />
                    <span className="truncate">{candidate.email}</span>
                  </div>
                  {candidate.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Phone size={14} />
                      <span>{candidate.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {candidate.skills && candidate.skills.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Habilidades</p>
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 4).map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {candidate.skills.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{candidate.skills.length - 4}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Agregado: {formatDate(candidate.addedToTalentBank)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredCandidates.length === 0 && (
          <Card className="col-span-full py-12">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Users size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No se encontraron candidatos' : 'No hay candidatos en el banco de talento'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Los candidatos destacados se guardarán aquí para futuras oportunidades'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {selectedCandidate && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={selectedCandidate.photoUrl} alt={selectedCandidate.name} />
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                      {getInitials(selectedCandidate.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl">{selectedCandidate.name}</DialogTitle>
                    <DialogDescription className="space-y-1 mt-2">
                      <div className="flex items-center gap-2">
                        <EnvelopeSimple size={16} />
                        <span>{selectedCandidate.email}</span>
                      </div>
                      {selectedCandidate.phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={16} />
                          <span>{selectedCandidate.phone}</span>
                        </div>
                      )}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                {selectedCandidate.workExperience && selectedCandidate.workExperience.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase size={20} className="text-primary" weight="duotone" />
                      <h3 className="font-semibold">Experiencia Laboral</h3>
                    </div>
                    <div className="space-y-3">
                      {selectedCandidate.workExperience.map((exp) => (
                        <div key={exp.id} className="pl-4 border-l-2 border-primary/20">
                          <h4 className="font-medium">{exp.position}</h4>
                          <p className="text-sm text-muted-foreground">{exp.company}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(exp.startDate)} - {exp.current ? 'Actual' : formatDate(exp.endDate || '')}
                          </p>
                          {exp.description && (
                            <p className="text-sm mt-2">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCandidate.education && selectedCandidate.education.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap size={20} className="text-primary" weight="duotone" />
                      <h3 className="font-semibold">Educación</h3>
                    </div>
                    <div className="space-y-3">
                      {selectedCandidate.education.map((edu) => (
                        <div key={edu.id} className="pl-4 border-l-2 border-primary/20">
                          <h4 className="font-medium">{edu.degree} en {edu.field}</h4>
                          <p className="text-sm text-muted-foreground">{edu.institution}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(edu.startDate)} - {edu.current ? 'En curso' : formatDate(edu.endDate || '')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Star size={20} className="text-primary" weight="duotone" />
                      <h3 className="font-semibold">Habilidades</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-3">Notas Internas</h3>
                  <Textarea
                    placeholder="Agrega notas sobre este candidato..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                {activeJobs.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Sugerir para una Vacante</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {activeJobs.slice(0, 5).map((job) => (
                        <Button
                          key={job.id}
                          variant="outline"
                          className="justify-start"
                          onClick={() => {
                            onSuggestJob(selectedCandidate.id, job.id)
                            setSelectedCandidate(null)
                          }}
                        >
                          <Briefcase size={16} className="mr-2" />
                          {job.title}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setSelectedCandidate(null)}>
                    Cerrar
                  </Button>
                  <Button className="flex-1" onClick={handleSaveNotes}>
                    Guardar Notas
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
