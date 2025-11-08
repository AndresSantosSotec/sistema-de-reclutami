import { useState, useEffect } from 'react'
import { Skills } from './Skills'
import { skillService, type Skill } from '@/lib/services/skillService'
import { toast } from 'sonner'

export function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSkills()
  }, [])

  const loadSkills = async () => {
    try {
      setLoading(true)
      const data = await skillService.getSkills()
      setSkills(data)
    } catch (error) {
      console.error('Error loading skills:', error)
      toast.error('Error al cargar las habilidades')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSkill = async (skillData: Omit<Skill, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newSkill = await skillService.createSkill(skillData)
      setSkills([...skills, newSkill])
    } catch (error: any) {
      console.error('Error creating skill:', error)
      const message = error.response?.data?.message || 'Error al crear la habilidad'
      toast.error(message)
      throw error
    }
  }

  const handleUpdateSkill = async (id: string, skillData: Partial<Skill>) => {
    try {
      const updatedSkill = await skillService.updateSkill(id, skillData)
      setSkills(skills.map(s => s.id === id ? updatedSkill : s))
    } catch (error: any) {
      console.error('Error updating skill:', error)
      const message = error.response?.data?.message || 'Error al actualizar la habilidad'
      toast.error(message)
      throw error
    }
  }

  const handleDeleteSkill = async (id: string) => {
    try {
      await skillService.deleteSkill(id)
      setSkills(skills.filter(s => s.id !== id))
    } catch (error: any) {
      console.error('Error deleting skill:', error)
      const message = error.response?.data?.message || 'Error al eliminar la habilidad'
      toast.error(message)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando habilidades...</p>
        </div>
      </div>
    )
  }

  return (
    <Skills
      skills={skills}
      onAddSkill={handleAddSkill}
      onUpdateSkill={handleUpdateSkill}
      onDeleteSkill={handleDeleteSkill}
    />
  )
}
