import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DownloadSimple, FunnelSimple } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Candidate, Application, JobOffer, JobCategory, ExportFilters } from '@/lib/types'
import { statusLabels } from '@/lib/constants'

interface ExportDataProps {
  candidates: Candidate[]
  applications: Application[]
  jobs: JobOffer[]
  categories: JobCategory[]
}

export function ExportData({ candidates, applications, jobs, categories }: ExportDataProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<ExportFilters>({})
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const handleExport = (format: 'csv' | 'json') => {
    let filteredCandidates = candidates

    const candidateIds = new Set(
      applications
        .filter(app => {
          if (filters.jobIds && filters.jobIds.length > 0) {
            if (!filters.jobIds.includes(app.jobId)) return false
          }
          if (filters.status && filters.status.length > 0) {
            if (!filters.status.includes(app.status)) return false
          }
          if (filters.dateFrom) {
            if (new Date(app.appliedAt) < new Date(filters.dateFrom)) return false
          }
          if (filters.dateTo) {
            if (new Date(app.appliedAt) > new Date(filters.dateTo)) return false
          }
          return true
        })
        .map(app => app.candidateId)
    )

    if (candidateIds.size > 0) {
      filteredCandidates = filteredCandidates.filter(c => candidateIds.has(c.id))
    }

    if (filters.skills && filters.skills.length > 0) {
      filteredCandidates = filteredCandidates.filter(c =>
        c.skills?.some(skill => 
          filters.skills!.some(filterSkill => 
            skill.toLowerCase().includes(filterSkill.toLowerCase())
          )
        )
      )
    }

    if (filters.minExperience && filters.minExperience > 0) {
      filteredCandidates = filteredCandidates.filter(c => {
        const yearsOfExp = c.workExperience?.reduce((total, exp) => {
          const start = new Date(exp.startDate)
          const end = exp.current ? new Date() : new Date(exp.endDate || new Date())
          const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365)
          return total + years
        }, 0) || 0
        return yearsOfExp >= filters.minExperience!
      })
    }

    if (filters.categories && filters.categories.length > 0) {
      const jobsInCategories = jobs.filter(j => 
        filters.categories!.includes(j.categoryId || '')
      ).map(j => j.id)
      
      const candidatesInCategories = new Set(
        applications
          .filter(app => jobsInCategories.includes(app.jobId))
          .map(app => app.candidateId)
      )
      
      filteredCandidates = filteredCandidates.filter(c => candidatesInCategories.has(c.id))
    }

    if (filteredCandidates.length === 0) {
      toast.error('No hay candidatos que coincidan con los filtros seleccionados')
      return
    }

    const enrichedData = filteredCandidates.map(candidate => {
      const candidateApps = applications.filter(app => app.candidateId === candidate.id)
      const jobTitles = candidateApps.map(app => {
        const job = jobs.find(j => j.id === app.jobId)
        return job?.title || 'Desconocido'
      })

      return {
        nombre: candidate.name,
        email: candidate.email,
        telefono: candidate.phone,
        linkedin: candidate.linkedin || '',
        habilidades: candidate.skills?.join(', ') || '',
        experienciaLaboral: candidate.workExperience?.length || 0,
        educacion: candidate.education?.map(edu => `${edu.degree} en ${edu.field}`).join('; ') || '',
        vacantesAplicadas: jobTitles.join(', '),
        estado: statusLabels[candidate.status] || candidate.status,
        fechaPostulacion: new Date(candidate.appliedAt).toLocaleDateString('es-ES')
      }
    })

    if (format === 'csv') {
      const headers = Object.keys(enrichedData[0])
      const csvContent = [
        headers.join(','),
        ...enrichedData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row]
            return typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : value
          }).join(',')
        )
      ].join('\n')

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `candidatos_export_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      
      toast.success(`${filteredCandidates.length} candidatos exportados a CSV`)
    } else if (format === 'json') {
      const jsonContent = JSON.stringify(enrichedData, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `candidatos_export_${new Date().toISOString().split('T')[0]}.json`
      link.click()
      
      toast.success(`${filteredCandidates.length} candidatos exportados a JSON`)
    }

    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <DownloadSimple className="mr-2" />
          Exportar Base de Datos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Exportar Base de Datos de Candidatos</DialogTitle>
          <DialogDescription>
            Filtra y exporta la información de candidatos en CSV o JSON
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FunnelSimple size={18} />
                Filtros de Exportación
              </CardTitle>
              <CardDescription>
                Selecciona los criterios para filtrar los candidatos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Estado de Postulación</Label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${key}`}
                        checked={selectedStatuses.includes(key)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedStatuses([...selectedStatuses, key])
                            setFilters({ ...filters, status: [...(filters.status || []), key as any] })
                          } else {
                            setSelectedStatuses(selectedStatuses.filter(s => s !== key))
                            setFilters({ 
                              ...filters, 
                              status: filters.status?.filter(s => s !== key)
                            })
                          }
                        }}
                      />
                      <label
                        htmlFor={`status-${key}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Categoría de Vacante</Label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCategories([...selectedCategories, category.id])
                            setFilters({ 
                              ...filters, 
                              categories: [...(filters.categories || []), category.id] 
                            })
                          } else {
                            setSelectedCategories(selectedCategories.filter(c => c !== category.id))
                            setFilters({ 
                              ...filters, 
                              categories: filters.categories?.filter(c => c !== category.id)
                            })
                          }
                        }}
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date-from">Fecha Desde</Label>
                  <Input
                    id="date-from"
                    type="date"
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-to">Fecha Hasta</Label>
                  <Input
                    id="date-to"
                    type="date"
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min-experience">Años Mínimos de Experiencia</Label>
                <Input
                  id="min-experience"
                  type="number"
                  min="0"
                  placeholder="Ej: 2"
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    minExperience: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Habilidades (separadas por coma)</Label>
                <Input
                  id="skills"
                  placeholder="Ej: React, TypeScript, Python"
                  onChange={(e) => {
                    const skills = e.target.value
                      .split(',')
                      .map(s => s.trim())
                      .filter(s => s.length > 0)
                    setFilters({ ...filters, skills: skills.length > 0 ? skills : undefined })
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => handleExport('csv')}>
              <DownloadSimple className="mr-2" />
              Exportar CSV
            </Button>
            <Button onClick={() => handleExport('json')}>
              <DownloadSimple className="mr-2" />
              Exportar JSON
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
