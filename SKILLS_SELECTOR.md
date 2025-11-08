# Selector Múltiple de Habilidades

## 📋 Descripción
Selector múltiple de habilidades implementado en el formulario de creación/edición de ofertas laborales.

## ✨ Características

### 1. **Búsqueda en Tiempo Real**
- Campo de búsqueda que filtra habilidades por nombre
- Actualización instantánea de resultados

### 2. **Filtro por Categoría**
- Dropdown con todas las categorías disponibles (15 categorías)
- Incluye:
  - Programación
  - DevOps
  - Bases de Datos
  - Frontend
  - Backend
  - Diseño
  - Análisis de Datos
  - Seguridad
  - Soft Skills
  - Marketing
  - Recursos Humanos
  - Contabilidad
  - Y más...

### 3. **Interfaz Visual**
- **Badges con habilidades seleccionadas**: 
  - Se muestran en la parte superior del selector
  - Cada badge tiene un botón X para remover la habilidad
  - Diseño compacto con colores distintivos

- **Lista desplegable**:
  - Aparece al hacer foco en el campo de búsqueda
  - Muestra hasta 20 resultados
  - Cada item muestra el nombre y categoría de la habilidad
  - Click para agregar habilidad

### 4. **Gestión de Estado**
```typescript
// Estados principales
const [allSkills, setAllSkills] = useState<Skill[]>([])        // Todas las habilidades del sistema
const [selectedSkills, setSelectedSkills] = useState<string[]>([]) // IDs de habilidades seleccionadas
const [skillSearchTerm, setSkillSearchTerm] = useState('')      // Término de búsqueda
const [skillCategoryFilter, setSkillCategoryFilter] = useState<string>('all') // Filtro de categoría
```

### 5. **Filtrado Inteligente**
```typescript
const filteredSkills = allSkills.filter(skill => {
  const matchesSearch = skill.nombre.toLowerCase().includes(skillSearchTerm.toLowerCase())
  const matchesCategory = skillCategoryFilter === 'all' || skill.categoria === skillCategoryFilter
  return matchesSearch && matchesCategory && !selectedSkills.includes(skill.id)
})
```
- Excluye habilidades ya seleccionadas
- Combina búsqueda por texto + filtro por categoría
- Case-insensitive

### 6. **Funciones Helper**
```typescript
// Agregar/remover habilidad
const toggleSkill = (skillId: string) => {
  setSelectedSkills(prev => 
    prev.includes(skillId) 
      ? prev.filter(id => id !== skillId)
      : [...prev, skillId]
  )
}

// Remover habilidad específica
const removeSkill = (skillId: string) => {
  setSelectedSkills(prev => prev.filter(id => id !== skillId))
}
```

## 🎨 Diseño UI/UX

### Flujo de Uso:
1. Usuario abre el formulario de nueva oferta
2. Busca habilidades usando el campo de texto o filtro de categoría
3. Click en una habilidad para agregarla
4. La habilidad aparece como badge en la parte superior
5. Click en X del badge para removerla
6. Al enviar el formulario, las habilidades seleccionadas se registran en console

### Estados Visuales:
- **Habilidades seleccionadas**: Badges secundarios con botón X
- **Lista de sugerencias**: Card con scroll, máximo 20 items
- **Sin resultados**: Mensaje informativo
- **Categorías en badges**: Outline badges para mostrar la categoría de cada skill

## 🔄 Integración con Backend

### Datos que se envían:
```javascript
console.log('📋 Habilidades seleccionadas:', selectedSkills)
// Ejemplo: ["skill-1", "skill-12", "skill-45"]

console.log('📋 Detalles de habilidades:', selectedSkills.map(id => {
  const skill = allSkills.find(s => s.id === id)
  return { id, nombre: skill?.nombre, categoria: skill?.categoria }
}))
// Ejemplo: 
// [
//   { id: "skill-1", nombre: "Python", categoria: "Programación" },
//   { id: "skill-12", nombre: "React", categoria: "Frontend" },
//   { id: "skill-45", nombre: "Liderazgo", categoria: "Soft Skills" }
// ]
```

### Próximos pasos para integración completa:
1. Actualizar `JobsPage.tsx` para enviar `selectedSkills` al backend
2. Modificar endpoint `POST /api/v1/admin/ofertas` para recibir array de habilidad IDs
3. Backend debe insertar registros en tabla pivot `oferta_habilidades`
4. Al editar oferta, cargar habilidades asociadas desde el backend
5. Mostrar habilidades requeridas en el detalle de la oferta

## 📊 Datos Disponibles

El selector consume las 154 habilidades precargadas:
- **Técnicas**: Programación, DevOps, Bases de Datos, Frontend, Backend, Seguridad
- **Análisis**: Análisis de Datos, Excel, Power BI, Machine Learning
- **Soft Skills**: Comunicación, Liderazgo, Trabajo en Equipo, Gestión del Tiempo
- **Especializadas**: Diseño, Marketing, RRHH, Contabilidad, Ingeniería
- **Idiomas**: Inglés, Francés, Alemán, Portugués, Chino

## 🚀 Ventajas

✅ **UX mejorada**: Búsqueda + filtros facilitan encontrar habilidades  
✅ **Visual claro**: Badges muestran claramente qué se ha seleccionado  
✅ **Escalable**: Funciona con 154+ habilidades sin problemas de performance  
✅ **Validación**: Solo muestra habilidades activas  
✅ **Limpieza automática**: Resetea al abrir nuevo formulario  
✅ **Límite de resultados**: Máximo 20 para evitar listas largas  

## 🐛 Notas de Desarrollo

- Las habilidades se cargan una sola vez al montar el componente
- Solo se muestran habilidades con `activa: true`
- El dropdown se cierra automáticamente al seleccionar una habilidad
- El campo de búsqueda se limpia después de cada selección
- Los filtros son independientes y se pueden combinar

---

**Archivo**: `sistema-de-reclutami/src/components/Jobs.tsx`  
**Líneas**: Aproximadamente 24-115 (estados y funciones helper)  
**UI**: Líneas 302-414 (selector visual en formulario)
