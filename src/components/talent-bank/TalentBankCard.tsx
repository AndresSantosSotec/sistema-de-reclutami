import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { EnvelopeSimple, Phone } from '@phosphor-icons/react'
import { formatDate } from '@/lib/constants'
import type { TalentBankCandidate } from '@/lib/types'

interface TalentBankCardProps {
  candidate: TalentBankCandidate
  onClick: (candidate: TalentBankCandidate) => void
}

function TalentBankCardComponent({ candidate, onClick }: TalentBankCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <Card 
      key={candidate.id} 
      className="hover:shadow-lg transition-all cursor-pointer" 
      onClick={() => onClick(candidate)}
    >
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 flex-shrink-0">
            <AvatarImage src={candidate.avatar} alt={candidate.name} loading="lazy" />
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
                <span className="truncate">{candidate.phone}</span>
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
                <Badge key={`${candidate.id}-skill-${idx}`} variant="secondary" className="text-xs">
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
  )
}

// Componente optimizado con memo para evitar re-renderizados innecesarios
export const TalentBankCard = memo(TalentBankCardComponent, (prevProps, nextProps) => {
  // Solo re-renderizar si cambian los datos importantes del candidato
  return (
    prevProps.candidate.id === nextProps.candidate.id &&
    prevProps.candidate.name === nextProps.candidate.name &&
    prevProps.candidate.email === nextProps.candidate.email &&
    prevProps.candidate.phone === nextProps.candidate.phone &&
    JSON.stringify(prevProps.candidate.skills) === JSON.stringify(nextProps.candidate.skills) &&
    prevProps.candidate.addedToTalentBank === nextProps.candidate.addedToTalentBank
  )
})

TalentBankCard.displayName = 'TalentBankCard'

