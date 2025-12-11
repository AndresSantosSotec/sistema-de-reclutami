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
      className="hover:shadow-lg transition-all cursor-pointer h-full flex flex-col" 
      onClick={() => onClick(candidate)}
    >
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <Avatar className="w-12 h-12 sm:w-14 sm:h-16 flex-shrink-0">
            <AvatarImage src={candidate.avatar} alt={candidate.name} loading="lazy" />
            <AvatarFallback className="text-sm sm:text-base bg-primary/10 text-primary">
              {getInitials(candidate.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg truncate leading-tight">{candidate.name}</CardTitle>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
              <EnvelopeSimple size={12} className="flex-shrink-0 sm:w-3.5 sm:h-3.5" />
              <span className="truncate break-all">{candidate.email}</span>
            </div>
            {candidate.phone && (
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                <Phone size={12} className="flex-shrink-0 sm:w-3.5 sm:h-3.5" />
                <span className="truncate">{candidate.phone}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3 pt-0 flex-1 flex flex-col">
        {candidate.skills && candidate.skills.length > 0 && (
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground mb-1.5 sm:mb-2">Habilidades</p>
            <div className="flex flex-wrap gap-1">
              {candidate.skills.slice(0, 4).map((skill, idx) => (
                <Badge key={`${candidate.id}-skill-${idx}`} variant="secondary" className="text-xs px-1.5 sm:px-2 py-0.5">
                  <span className="truncate max-w-[100px] sm:max-w-none">{skill}</span>
                </Badge>
              ))}
              {candidate.skills.length > 4 && (
                <Badge variant="secondary" className="text-xs px-1.5 sm:px-2 py-0.5">
                  +{candidate.skills.length - 4}
                </Badge>
              )}
            </div>
          </div>
        )}
        <div className="pt-2 border-t mt-auto">
          <p className="text-xs text-muted-foreground truncate">
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

