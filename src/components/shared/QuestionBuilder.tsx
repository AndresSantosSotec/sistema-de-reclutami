import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash, PencilSimple } from '@phosphor-icons/react'
import type { CustomQuestion, QuestionType, QuestionOption } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

interface QuestionBuilderProps {
  questions: CustomQuestion[]
  onChange: (questions: CustomQuestion[]) => void
}

export function QuestionBuilder({ questions, onChange }: QuestionBuilderProps) {
  const [editingQuestion, setEditingQuestion] = useState<CustomQuestion | null>(null)
  const [questionText, setQuestionText] = useState('')
  const [questionType, setQuestionType] = useState<QuestionType>('text')
  const [isRequired, setIsRequired] = useState(true)
  const [options, setOptions] = useState<QuestionOption[]>([])
  const [newOption, setNewOption] = useState('')

  const handleAddOption = () => {
    if (newOption.trim()) {
      setOptions(prev => [...prev, { id: `opt-${Date.now()}`, text: newOption.trim() }])
      setNewOption('')
    }
  }

  const handleRemoveOption = (id: string) => {
    setOptions(prev => prev.filter(opt => opt.id !== id))
  }

  const handleSaveQuestion = () => {
    if (!questionText.trim()) return

    const needsOptions = questionType === 'multiple-choice' || questionType === 'single-choice'
    if (needsOptions && options.length < 2) {
      alert('Las preguntas de opción múltiple necesitan al menos 2 opciones')
      return
    }

    const question: CustomQuestion = {
      id: editingQuestion?.id || `q-${Date.now()}`,
      text: questionText,
      type: questionType,
      required: isRequired,
      options: needsOptions ? options : undefined
    }

    if (editingQuestion) {
      onChange(questions.map(q => q.id === editingQuestion.id ? question : q))
    } else {
      onChange([...questions, question])
    }

    handleReset()
  }

  const handleReset = () => {
    setEditingQuestion(null)
    setQuestionText('')
    setQuestionType('text')
    setIsRequired(true)
    setOptions([])
    setNewOption('')
  }

  const handleEditQuestion = (question: CustomQuestion) => {
    setEditingQuestion(question)
    setQuestionText(question.text)
    setQuestionType(question.type)
    setIsRequired(question.required)
    setOptions(question.options || [])
  }

  const handleDeleteQuestion = (id: string) => {
    onChange(questions.filter(q => q.id !== id))
  }

  const typeLabels: Record<QuestionType, string> = {
    'text': 'Texto libre',
    'multiple-choice': 'Opción múltiple',
    'single-choice': 'Selección única',
    'numeric': 'Numérico'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {editingQuestion ? 'Editar Pregunta' : 'Agregar Pregunta Personalizada'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Pregunta</Label>
            <Input
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="¿Cuál es tu pretensión salarial?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de respuesta</Label>
              <Select value={questionType} onValueChange={(v: QuestionType) => setQuestionType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto libre</SelectItem>
                  <SelectItem value="single-choice">Selección única</SelectItem>
                  <SelectItem value="multiple-choice">Opción múltiple</SelectItem>
                  <SelectItem value="numeric">Numérico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>¿Obligatoria?</Label>
              <div className="flex items-center h-10">
                <Switch checked={isRequired} onCheckedChange={setIsRequired} />
                <span className="ml-2 text-sm">{isRequired ? 'Sí' : 'No'}</span>
              </div>
            </div>
          </div>

          {(questionType === 'multiple-choice' || questionType === 'single-choice') && (
            <div className="space-y-2">
              <Label>Opciones de respuesta</Label>
              <div className="flex gap-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Escribe una opción"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                />
                <Button type="button" onClick={handleAddOption} size="sm">
                  <Plus size={18} />
                </Button>
              </div>
              {options.length > 0 && (
                <div className="space-y-2 mt-3">
                  {options.map((opt) => (
                    <div key={opt.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <span className="text-sm">{opt.text}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOption(opt.id)}
                      >
                        <Trash size={16} className="text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="button" onClick={handleSaveQuestion} className="flex-1">
              {editingQuestion ? 'Guardar Cambios' : 'Agregar Pregunta'}
            </Button>
            {editingQuestion && (
              <Button type="button" variant="outline" onClick={handleReset}>
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {questions.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium">Preguntas agregadas ({questions.length})</h3>
          {questions.map((q, idx) => (
            <Card key={q.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">#{idx + 1}</span>
                      <Badge variant="outline">{typeLabels[q.type]}</Badge>
                      {q.required && <Badge variant="outline" className="bg-accent/10">Obligatoria</Badge>}
                    </div>
                    <p className="text-sm mb-2">{q.text}</p>
                    {q.options && (
                      <div className="flex flex-wrap gap-1">
                        {q.options.map(opt => (
                          <Badge key={opt.id} variant="secondary" className="text-xs">
                            {opt.text}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditQuestion(q)}
                    >
                      <PencilSimple size={18} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuestion(q.id)}
                    >
                      <Trash size={18} className="text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}