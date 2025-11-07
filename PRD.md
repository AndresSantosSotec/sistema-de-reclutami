# Planning Guide

**Experience Qualities**:

**Experience Qualities**:
  - Sistema multi-módulo con gestión de usuarios, estados de proceso, notificaciones automáticas, y flujos de trabajo comple
## Essential Features
### 1. Autenticación de Administrador

**Complexity Level**: Complex Application (advanced functionality, accounts)
  - Sistema multi-módulo con gestión de usuarios, estados de proceso, notificaciones automáticas, y flujos de trabajo complejos que requieren persistencia robusta y coordinación entre múltiples entidades.

## Essential Features

### 1. Autenticación de Administrador
- **Functionality**: Sistema de login con credenciales únicas (correo y contraseña) y validación de rol
- **Purpose**: Garantizar acceso seguro y restricción a personal autorizado
- **Trigger**: Usuario accede a la URL del panel administrativo
- **Progression**: Pantalla de login → Validación de credenciales → Verificación de rol → Redirección a Dashboard
- **Success criteria**: Solo usuarios con rol "admin" acceden al panel; credenciales inválidas muestran error claro

### 2. Dashboard de Control Central
- **Functionality**: Métricas visuales del proceso de contratación (KPIs, alertas, resúmenes)
- **Purpose**: Ofrecer visión panorámica del estado del reclutamiento para decisiones estratégicas
- **Trigger**: Login exitoso del administrador
- **Progression**: Carga de métricas → Visualización de cards con estadísticas → Identificación de alertas → Navegación rápida a módulos
- **Success criteria**: Dashboard muestra números actualizados de postulaciones, entrevistas pendientes, ofertas activas; alertas destacan ítems urgentes

### 3. Gestión Completa de Ofertas Laborales
- **Functionality**: CRUD de ofertas con campos detallados (título, descripción, requisitos, ubicación, tipo contrato, fecha límite, visibilidad)
- **Progression**: Vista de candidato → Revisión de historial → Redacción de
- **Trigger**: Admin hace clic en "Nueva Oferta" o edita oferta existente
- **Progression**: Formulario de oferta → Validación de campos → Guardado → Sincronización con portal público → Confirmación visual
- **Success criteria**: Ofertas creadas aparecen en listado; cambios se reflejan en portal público; validación previene campos incompletos

### 4. Seguimiento de Postulaciones
- **Archivado Accidental**: Confirmación doble antes de archivar; capacidad de restaurar procesos 
## Design Direction
El diseño debe evocar profesionalismo corporativo y eficiencia operativa, con 
## Color Selection
Complementary (opposite colors)

- **Secondary Colors**: Gris neutro `okl
- **Foreground/Background Pairings**:
  - Card (Gris muy claro `oklch(0.98 0.005 250)`): Texto oscuro `oklch(0.2
  - Secondary (Gris claro `oklch(0.95 0.01 250)`): Texto oscuro `oklch(0.25 0.01 250)` - Ra
  - Muted (Gris medio `oklch(0.93 0.01 250)`): Texto gris oscuro `oklch(0.5 0.02 250)` - Ratio 6.8:1 ✓
## Font Selection

**Fuente Principal**: Inter - Sans-serif opti
- **Typographic Hierarchy**:
  - H2 (Títulos de Sección): Inter SemiBold / 24px / -0.01em letter-spacing /
  - Body (Texto General): Inter Regular / 15px / normal let
  - Labels (Formularios): Inter Medium / 14px / normal letter-spacing / line-height 1.5



- **Hierarchy of Movement**: 
  - Media prioridad: Transiciones entre vistas, expansión de cards c


  - **Dashboard**: Cards con estadísticas (custom stats cards con iconos de Phosphor), Progress bars para métricas, Alert para notificaciones ur

  - **Candidatos**: C

- **Customizations**:
  - Timeline component para visualizar historial de candidato en orden cronológico
  - Filter Bar custom con inputs de búsqueda y dropdowns de filtro para tablas complejas
- **States**:
  - Inputs: Outline gris neutro, focus con ring azul primario, error con borde rojo, 

  - Dashboard: ChartBar, Users, Briefcase, CalendarCheck
- **Archivado Accidental**: Confirmación doble antes de archivar; capacidad de restaurar procesos archivados

## Design Direction

El diseño debe evocar profesionalismo corporativo y eficiencia operativa, con una estética limpia tipo SaaS empresarial que inspire confianza en usuarios de recursos humanos. Interfaz rica con paneles informativos, gráficas de métricas y elementos visuales que guíen el flujo de trabajo, priorizando densidad de información organizada sobre minimalismo extremo para maximizar productividad.

## Color Selection

Complementary (opposite colors)
Paleta profesional con azul corporativo como primario (confianza, estabilidad) y naranja cálido como acento (acción, urgencia), creando contraste visual que destaca elementos interactivos y estados críticos.

- **Primary Color**: Azul corporativo profundo `oklch(0.45 0.12 250)` - Comunica profesionalismo, confianza y estabilidad institucional
- **Secondary Colors**: Gris neutro `oklch(0.95 0.01 250)` para fondos secundarios y elementos de soporte; Azul claro `oklch(0.88 0.06 250)` para estados hover
- **Accent Color**: Naranja energético `oklch(0.68 0.15 45)` - Resalta CTAs importantes, alertas urgentes y elementos que requieren atención inmediata
- **Foreground/Background Pairings**:
  - Background (Blanco `oklch(1 0 0)`): Texto principal gris oscuro `oklch(0.25 0.01 250)` - Ratio 14.2:1 ✓
  - Card (Gris muy claro `oklch(0.98 0.005 250)`): Texto oscuro `oklch(0.25 0.01 250)` - Ratio 13.8:1 ✓
  - Primary (Azul corporativo `oklch(0.45 0.12 250)`): Texto blanco `oklch(1 0 0)` - Ratio 8.5:1 ✓
  - Secondary (Gris claro `oklch(0.95 0.01 250)`): Texto oscuro `oklch(0.25 0.01 250)` - Ratio 13.1:1 ✓
  - Accent (Naranja `oklch(0.68 0.15 45)`): Texto blanco `oklch(1 0 0)` - Ratio 5.2:1 ✓
  - Muted (Gris medio `oklch(0.93 0.01 250)`): Texto gris oscuro `oklch(0.5 0.02 250)` - Ratio 6.8:1 ✓

## Font Selection

Tipografía sans-serif moderna y legible que transmite profesionalismo corporativo y facilita lectura prolongada de datos tabulares y formularios extensos.

**Fuente Principal**: Inter - Sans-serif optimizada para interfaces digitales con excelente legibilidad en pantallas

- **Typographic Hierarchy**:
  - H1 (Títulos de Página): Inter SemiBold / 32px / -0.02em letter-spacing / line-height 1.2
  - H2 (Títulos de Sección): Inter SemiBold / 24px / -0.01em letter-spacing / line-height 1.3
  - H3 (Subtítulos de Cards): Inter Medium / 18px / normal letter-spacing / line-height 1.4
  - Body (Texto General): Inter Regular / 15px / normal letter-spacing / line-height 1.6
  - Small (Metadata, Timestamps): Inter Regular / 13px / normal letter-spacing / line-height 1.5
  - Labels (Formularios): Inter Medium / 14px / normal letter-spacing / line-height 1.5
  - Buttons (CTAs): Inter Medium / 15px / normal letter-spacing / line-height 1

## Animations

Animaciones sutiles y funcionales que refuerzan jerarquía y guían la atención sin distraer de tareas críticas; transiciones fluidas entre estados y micro-interacciones que confirman acciones importantes.

- **Purposeful Meaning**: Movimiento comunica cambios de estado (nuevo candidato ingresa desde el lado), confirmaciones (checkmark animado al guardar), y relaciones jerárquicas (modales emergen desde el elemento que los activó)
- **Hierarchy of Movement**: 
  - Alta prioridad: Confirmaciones de guardado, alertas críticas, notificaciones de cambio de estado
  - Media prioridad: Transiciones entre vistas, expansión de cards con detalles
  - Baja prioridad: Hover states, tooltips informativos

## Component Selection

- **Components**:
  - **Dashboard**: Cards con estadísticas (custom stats cards con iconos de Phosphor), Progress bars para métricas, Alert para notificaciones urgentes
  - **Ofertas**: Table para listado, Dialog para crear/editar, Badge para estados (activa/cerrada), Calendar para fecha límite
  - **Postulaciones**: Table con sorting/filtering, Avatar para foto de candidato, Tabs para categorizar por estado, Sheet lateral para vista detallada de CV
  - **Evaluaciones**: Form con campos estructurados, Textarea para observaciones, Radio Group para resultados, Calendar para programar fechas
  - **Candidatos**: Card para vista de perfil, Timeline (custom) para historial, Badge para estados del proceso, Accordion para secciones de información
  - **Notificaciones**: Toast (Sonner) para confirmaciones, Dialog para redactar mensajes personalizados
  - **Navegación**: Sidebar con iconos de Phosphor (User, Briefcase, FileText, Calendar, Bell)

- **Customizations**:
  - Stats Cards custom con gradientes sutiles y iconos grandes para el Dashboard
  - Timeline component para visualizar historial de candidato en orden cronológico
  - Status Badge con colores semánticos (verde=contratado, azul=en proceso, rojo=rechazado, amarillo=pendiente)
  - Filter Bar custom con inputs de búsqueda y dropdowns de filtro para tablas complejas

- **States**:
  - Buttons: Default con sombra sutil, hover con elevación, active con scale-down, disabled con opacidad 50%
  - Inputs: Outline gris neutro, focus con ring azul primario, error con borde rojo, success con check verde
  - Table Rows: Hover con background secundario, selected con borde azul izquierdo, expandable con transición smooth

- **Icon Selection**:
  - Dashboard: ChartBar, Users, Briefcase, CalendarCheck
  - Ofertas: Plus, PencilSimple, Trash, Eye, EyeSlash

  - Evaluaciones: ClipboardText, VideoCamera, FileText, Star
  - Candidatos: User, Envelope, Phone, LinkedinLogo, FileArrowDown
  - Estados: Circle (pending), Clock (interview), Flask (test), CheckCircle (hired), XCircle (rejected)
  - Navegación: House, Briefcase, UserList, ClipboardText, Bell, SignOut

- **Spacing**:
  - Container padding: px-6 py-8 en desktop, px-4 py-6 en mobile

  - Form fields: mb-4 entre inputs, gap-6 entre secciones
  - Table cells: px-4 py-3 con gap-8 entre columnas
  - Buttons: px-4 py-2 para medium, px-6 py-3 para large

- **Mobile**:
  - Sidebar colapsa a hamburger menu en <768px
  - Tables se convierten en cards apiladas con información clave visible
  - Multi-column layouts se apilan verticalmente
  - Dashboard stats pasan de grid 4-columnas a 2-columnas (tablet) a 1-columna (mobile)

  - Sheet lateral ocupa full-width en mobile para detalles de candidatos
