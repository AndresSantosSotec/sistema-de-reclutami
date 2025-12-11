import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, MapPin, Star } from '@phosphor-icons/react'
import type { Candidate } from '@/lib/types'

interface CandidateCardProps {
  candidate: Candidate
  onClick: (candidateId: string) => void
}

function CandidateCardComponent({ candidate, onClick }: CandidateCardProps) {
  return (
    <Card 
      key={candidate.id} 
      className="hover:shadow-lg transition-all cursor-pointer hover:border-primary/50 h-full flex flex-col" 
      onClick={() => onClick(candidate.id)}
    >
      <CardContent className="pt-6 pb-4 flex-1 flex flex-col">
        <div className="flex items-start gap-3 sm:gap-4 flex-1">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
            {candidate.avatar ? (
              <img 
                src={candidate.avatar} 
                alt={candidate.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover"
                loading="lazy"
                onError={(e) => {
                  // Si la imagen falla, mostrar el icono por defecto
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const parent = target.parentElement
                  if (parent) {
                    const icon = document.createElement('div')
                    icon.innerHTML = '<svg>...</svg>'
                    parent.appendChild(icon)
                  }
                }}
              />
            ) : (
              <User size={28} weight="duotone" className="text-primary sm:w-8 sm:h-8" />
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col">
            <h3 className="font-semibold truncate text-base sm:text-lg leading-tight">{candidate.name}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate mt-1">{candidate.email}</p>
            {candidate.phone && (
              <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                <MapPin size={12} className="flex-shrink-0" />
                <span className="truncate">{candidate.phone}</span>
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2 flex-shrink-0">
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {candidate.skills?.length || 0} skill{(candidate.skills?.length || 0) !== 1 ? 's' : ''}
              </Badge>
              {candidate.workExperience && candidate.workExperience.length > 0 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  <Star size={12} className="mr-1 inline" />
                  {candidate.workExperience.length} exp.
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente optimizado con memo para evitar re-renderizados innecesarios
export const CandidateCard = memo(CandidateCardComponent, (prevProps, nextProps) => {
  // Solo re-renderizar si cambian los datos importantes del candidato
  return (
    prevProps.candidate.id === nextProps.candidate.id &&
    prevProps.candidate.name === nextProps.candidate.name &&
    prevProps.candidate.email === nextProps.candidate.email &&
    prevProps.candidate.phone === nextProps.candidate.phone &&
    JSON.stringify(prevProps.candidate.skills) === JSON.stringify(nextProps.candidate.skills) &&
    prevProps.candidate.workExperience?.length === nextProps.candidate.workExperience?.length
  )
})

CandidateCard.displayName = 'CandidateCard'

