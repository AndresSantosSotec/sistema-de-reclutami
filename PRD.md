# Planning Guide

A comprehensive institutional recruitment platform powered by AI that transforms how organizations manage their complete hiring lifecycle from job posting to candidate onboarding, featuring intelligent candidate evaluation, psychometric test integration, talent banking, and detailed analytics for data-driven hiring decisions.

**Experience Qualities**:
1. **Intelligently Efficient** - Leverage AI-powered candidate analysis to identify top talent automatically, reducing manual review time while providing deeper insights into candidate compatibility through skills extraction, match scoring, and intelligent recommendations.
2. **Transparently Connected** - Provide real-time visibility into every stage of the recruitment process for both administrators and candidates, with automated notifications, progress tracking, and seamless integration with external psychometric testing platforms.
3. **Strategically Insightful** - Transform recruitment data into actionable intelligence through comprehensive metrics dashboards, exportable databases with advanced filtering, and talent bank management for maintaining relationships with promising candidates.

**Complexity Level**: Complex Application (advanced functionality, accounts)
  - Requires sophisticated user authentication with registration and password recovery, AI integration for candidate analysis, multi-stage process tracking, external service integration for psychometric testing, comprehensive data export capabilities with advanced filtering, and analytics dashboards for strategic recruitment insights.

## Essential Features

### Enhanced User Authentication System
- **Functionality**: Complete authentication system with user registration, login, and password recovery capabilities, replacing simple credential checks with full account management
- **Purpose**: Enable multiple administrators to manage their own accounts securely while providing self-service password recovery and account creation
- **Trigger**: User navigates to login page and selects registration tab or forgot password option
- **Progression**: Landing page → Login/Register/Recover tabs → Enter credentials → Validation → Account created/Password recovered → Dashboard access
- **Success criteria**: Users can create accounts with validation, recover passwords with email simulation, login with stored credentials, accounts persist across sessions

### AI-Powered Candidate Analysis
- **Functionality**: Intelligent CV analysis using AI to extract skills, evaluate experience, calculate compatibility scores, identify strengths/concerns, and generate hiring recommendations automatically
- **Purpose**: Accelerate candidate screening by automatically identifying the most compatible profiles for each position, reducing manual review time while improving hiring quality
- **Trigger**: Administrator clicks "Analizar con IA" button on candidate profile in the Candidates section
- **Progression**: Candidate view → Click AI analysis → System extracts CV data → AI processes profile → Displays match score, skills, strengths, concerns, recommendation → Saved for future reference
- **Success criteria**: AI extracts relevant information from candidate profiles, provides meaningful match scores (0-100), identifies key strengths and concerns, generates actionable recommendations, results persist and display alongside candidate data

### Job Status Management (Available/Occupied)
- **Functionality**: Clear display and management of job positions showing active, filled, closed, and draft statuses with visual indicators and filtering capabilities
- **Purpose**: Allow candidates to see which positions are available and which are filled while maintaining a talent bank for future opportunities
- **Trigger**: Administrator updates job status to "filled" when position is occupied, or candidates view job listings with status badges
- **Progression**: Job management → Edit job → Change status to filled → Save → Status reflects in listings → Candidates see filled positions → Can still apply for talent bank
- **Success criteria**: Jobs display accurate status badges, filled positions are clearly marked, candidates can still view filled jobs for future reference, status changes reflect immediately

### Advanced Database Export with Filtering
- **Functionality**: Comprehensive data export system allowing administrators to filter candidates by status, category, date range, skills, experience years, and export to CSV or JSON formats
- **Purpose**: Enable HR teams to create custom candidate databases for specific needs, share data with stakeholders, and maintain external records
- **Trigger**: Administrator clicks "Exportar Base de Datos" button in Candidates or Jobs section
- **Progression**: Click export → Filter modal opens → Select criteria (status/category/dates/skills/experience) → Choose format (CSV/JSON) → Export → File downloads → Success notification
- **Success criteria**: Filters work correctly and can be combined, exported data includes all relevant candidate information, both CSV and JSON formats work properly, file naming includes date stamp

### Multi-Stage Process Tracking
- **Functionality**: Comprehensive status pipeline (Pendiente → En Revisión → Entrevista → Prueba Técnica → Contratado/Rechazado) with visual progress indicators, timeline history, and automatic notifications at each stage change
- **Purpose**: Provide transparency to both administrators and candidates about exactly where they are in the recruitment process
- **Trigger**: Administrator changes application status or system automatically updates based on actions
- **Progression**: Application view → Change status dropdown → Select new stage → Confirm → Status updates → Timeline logged → Candidate notified → Progress indicator updates → Both parties see current stage
- **Success criteria**: Status changes trigger notifications, timeline maintains complete history, visual indicators clearly show current stage, candidates can view their progress, administrators can track all candidates through pipeline

### Psychometric Test Integration
- **Functionality**: External psychometric test management allowing administrators to mark when tests are sent, track completion status, store external URLs, record results, and automatically notify candidates
- **Purpose**: Integrate with external psychometric platforms while maintaining test status tracking within the recruitment system
- **Trigger**: Administrator clicks "Enviar Prueba Psicométrica" from candidate evaluation section
- **Progression**: Candidate view → Send test button → Modal opens → Enter test name and URL → Send → Test marked as sent → Candidate notified with link → Administrator marks as complete → Results recorded → Both see updated status
- **Success criteria**: Test sending triggers automatic notification to candidate, external URLs are stored and accessible, status tracking shows pending/sent/in-progress/completed states, test history maintained per candidate, chatbot notifications work automatically

### Comprehensive Metrics & Reports Dashboard
- **Functionality**: Analytics dashboard displaying key recruitment metrics including total applications, applications by month/status, top requested positions, average time to hire, conversion rates, and traffic sources
- **Purpose**: Provide data-driven insights for strategic hiring decisions and process optimization
- **Trigger**: Administrator navigates to Metrics section from main navigation
- **Progression**: Click Metrics → Dashboard loads → Calculates real-time statistics → Displays visual charts → Shows trends → Allows date filtering → Exports reports
- **Success criteria**: All metrics calculate correctly from live data, charts are responsive and clear, trends are meaningful, dashboard performs well with large datasets, key indicators highlighted prominently

## Edge Case Handling

- **AI Analysis Failures**: If AI service is unavailable or returns invalid data, show user-friendly error message and allow retry, fallback to manual review workflow
- **Large Data Exports**: Implement progress indicators for exports with many candidates, warn users before exporting datasets over 1000 records
- **Concurrent Status Updates**: Handle race conditions when multiple admins update same candidate simultaneously with optimistic updates and conflict resolution
- **External Psychometric Links**: Validate URLs before saving, handle broken/expired links gracefully, provide test link preview
- **Incomplete Candidate Profiles**: AI analysis works with partial data, highlights missing information that would improve analysis quality
- **Multiple Test Assignments**: Allow multiple psychometric tests per candidate, track each separately with individual status and results
- **Export Filter Combinations**: Handle complex filter combinations logically (AND logic), show preview count before export
- **Session Management**: Implement automatic session persistence, warn users before timeout, preserve unsaved work
- **Password Recovery in Demo**: Simulate email sending with toast notification showing recovery information for demo purposes

## Design Direction

The design should evoke professional confidence with approachable warmth—think of a modern SaaS platform that respects institutional formality while embracing contemporary web aesthetics. A minimal interface with purposeful richness serves best: clean layouts with generous white space, strategic use of color to communicate status and hierarchy, and subtle animations that guide attention without distraction. The interface should feel like a premium recruitment tool that organizations are proud to brand as their own and candidates trust for transparency.

## Color Selection

**Analogous** (adjacent colors on the color wheel)
Using a harmonious blue-to-teal progression that communicates trust, professionalism, and forward-thinking innovation with enough variation to establish clear visual hierarchy while maintaining cohesive brand identity.

  - Form submissions show loading states but don't lock entire UI
- **Secondary Colors**: 
  - Success states celebrate briefly with checkmark animation then return to flow
  - Teal Accent `oklch(0.58 0.12 200)` - Secondary actions and progressive states to provide visual variety within the blue family
- **Accent Color**: Vibrant Teal `oklch(0.65 0.15 195)` - Dynamic CTAs, success states, and interactive element highlights to inject energy
- **Foreground/Background Pairings**:
  - Background `oklch(1 0 0)`: Dark Text `oklch(0.25 0.01 250)` - Ratio 14.2:1 ✓
  - Card `oklch(0.98 0.005 250)`: Dark Text `oklch(0.25 0.01 250)` - Ratio 13.1:1 ✓
  - **Select/Dropdowns**: Shadcn Select for status changes, filters, form cho
  - Secondary `oklch(0.92 0.03 250)`: Dark Text `oklch(0.25 0.01 250)` - Ratio 11.8:1 ✓
  - **Tabs**: Shadcn Tabs for candidate detail sections, profile organizatio
  - Muted `oklch(0.93 0.01 250)`: Muted Text `oklch(0.5 0.02 250)` - Ratio 6.5:1 ✓

## Font Selection

**Nunito Sans** for its humanist warmth balanced with professional clarity—rounded terminals soften the corporate feel while maintaining excellent legibility across all sizes, with robust weight variations supporting clear typographic hierarchy from dashboard metrics to form labels.

- **Typographic Hierarchy**: 
  - H1 (Page Titles): Nunito Sans SemiBold/32px/tight tracking/-0.02em - Dashboard, main section headers
  - H2 (Section Headers): Nunito Sans SemiBold/24px/normal tracking/0em - Card titles, modal headers  
  - H3 (Subsection Headers): Nunito Sans SemiBold/18px/normal tracking/0em - Form sections, table headers
  - Body (Primary Content): Nunito Sans Regular/16px/relaxed leading/1.6 - Descriptions, form inputs, table content
  - Dropdowns: Closed → Opening (scale from trigger) → Open (full scale) → Selecting (item highlight)
  - Tiny (Micro Text): Nunito Sans Medium/12px/tight leading/1.3 - Badges, timestamps, helper text

## Animations

Animations should feel purposeful and refined—present but never performative. They exist to guide attention, communicate state changes, and provide satisfying feedback rather than to impress. Think Apple's Human Interface Guidelines: animations should be fast enough not to delay user actions (150-300ms typical) but slow enough to be perceived as smooth transitions rather than jarring jumps.

- **Purposeful Meaning**: 
  - Button internal: px-6 py-3 for primary, px-4 py-2 for secondary
  - Status changes animate color transitions smoothly to reinforce the change has occurred
  - File uploads show progress bars with subtle pulse on completion
  - Notifications slide in from top-right with gentle bounce to feel friendly not aggressive
  - Hover states scale buttons slightly (1.0 → 1.02) and lift cards with shadow increase
  
  - Dashboard metrics stack v
  - Primary CTAs deserve micro-interactions (hover glow, active press depression)

  - Form submissions show loading states but don't lock entire UI

  - Critical actions (delete, reject) pause with confirm modals that fade backdrop




- **Components**: 
  - **Dialogs/Modals**: Shadcn Dialog for job creation, candidate details, evaluation scheduling with full-screen mobile breakpoints
  - **Cards**: Shadcn Card with hover elevation for job listings, dashboard metrics, candidate cards
  - **Forms**: Shadcn Form + React Hook Form for all input scenarios with inline validation and error states

  - **Select/Dropdowns**: Shadcn Select for status changes, filters, form choices with search for long lists

  - **Buttons**: Shadcn Button with Primary (filled), Secondary (outline), Ghost (text) variants
  - **Tabs**: Shadcn Tabs for candidate detail sections, profile organization, dashboard views
  - **Progress**: Shadcn Progress for profile completion, file uploads, multi-step forms

  - **Avatar**: Shadcn Avatar for profile photos with fallback initials

  - **Textarea**: Shadcn Textarea for descriptions, requirements, notes with character counts
  
- **Customizations**: 
  - **File Upload Component**: Custom drag-and-drop zone with preview, progress, and validation not provided by Shadcn
  - **Question Builder**: Custom admin interface to create dynamic form questions with type selection and option management
  - **Timeline Component**: Custom vertical timeline for candidate recruitment journey not in Shadcn base
  - **Image Upload with Crop**: Custom component for profile photos and job banners with client-side preview and aspect ratio control

  

  - Buttons: Default → Hover (slight scale + shadow) → Active (pressed depression) → Loading (spinner) → Success (checkmark flash) → Disabled (muted opacity)

  - Cards: Default → Hover (elevation increase) → Selected (border highlight) → Loading (pulse skeleton)

  

  - Phosphor Icons with duotone weight for visual interest

  - Plus (create), PencilSimple (edit), Trash (delete), Eye/EyeSlash (visibility), Calendar (schedule), Download (CV), Upload (files)

  

  - Container padding: p-4 mobile, p-8 desktop

  - Form fields: gap-6 between field groups, gap-2 between label and input

  - Section separation: mb-8 between major sections, mb-4 between related groups
  - Grid gaps: gap-6 for card grids, gap-4 for form layouts
  

  - Navigation collapses to horizontal scrolling tabs on mobile with burger menu for secondary actions
  - Tables transform to stacked cards showing key info with expand for full details
  - Modals become full-screen sheets on mobile for better focus and input accessibility

  - Dashboard metrics stack vertically with full-width cards
  - File uploads optimize for camera access on mobile devices
  - Fixed bottom action bars on mobile for primary CTAs (submit, save) to prevent keyboard obstruction
