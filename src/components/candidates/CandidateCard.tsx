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
      className="hover:shadow-lg transition-all cursor-pointer hover:border-primary/50" 
      onClick={() => onClick(candidate.id)}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
            {candidate.avatar ? (
              <img 
                src={candidate.avatar} 
                alt={candidate.name}
                className="w-16 h-16 rounded-full object-cover"
                loading="lazy"
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

