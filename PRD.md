# Planning Guide

A comprehensive institutional recruitment platform that transforms how organizations manage their complete hiring lifecycle from job posting to candidate onboarding, with dual interfaces for candidates and administrative staff.

**Experience Qualities**: 
1. **Professional yet Approachable** - Balance corporate credibility with human warmth through soft gradients, rounded corners, and friendly micro-interactions that make both candidates and HR staff feel confident and comfortable.
2. **Effortlessly Efficient** - Streamline complex recruitment workflows into intuitive, progressive steps that guide users naturally through applications, evaluations, and hiring decisions without cognitive overload.
3. **Transparently Informative** - Provide real-time visibility into application status, recruitment metrics, and candidate progress through clear visual hierarchies, status indicators, and contextual notifications.

**Complexity Level**: Complex Application (advanced functionality, accounts)
  - Requires dual user roles (candidates and administrators) with distinct interfaces, comprehensive data management across multiple entities (jobs, applications, candidates, evaluations), file uploads, customizable forms, notification systems, and sophisticated state tracking throughout the recruitment pipeline.

## Essential Features

### Dual Authentication System
- **Functionality**: Separate login flows for candidates (public portal) and administrators (management panel) with role-based access control
- **Purpose**: Secure access boundaries between public job seekers and internal HR staff while maintaining unified data architecture
- **Trigger**: User clicks "Ingresar" or "Panel Admin" from landing page or attempts to access protected routes
- **Progression**: Landing page → Role selection → Email/password entry → Validation → Role-specific dashboard
- **Success criteria**: Users authenticate successfully, sessions persist correctly, unauthorized access is blocked, logout clears sessions completely

### Job Offer Management (Admin)
- **Functionality**: Complete CRUD operations for job postings with custom fields including images, deadlines, requirements, custom application questions, and visibility controls
- **Purpose**: Empower HR teams to create compelling, detailed job listings that attract qualified candidates and collect relevant application data
- **Trigger**: Admin clicks "Crear Oferta" button in Jobs section
- **Progression**: Jobs list → Create form → Fill details (title, description, image upload, custom questions) → Preview → Publish → Appears in public portal
- **Success criteria**: Jobs save with all data intact, images display properly, custom questions render in application forms, status changes (active/closed/draft) work correctly

### Customizable Application Forms
- **Functionality**: Dynamic forms that adapt per job posting, allowing admins to add custom questions (text, multiple choice, numeric) that candidates answer during application
- **Purpose**: Gather job-specific information beyond standard CV data to better assess candidate fit and streamline initial screening
- **Trigger**: Candidate clicks "Postular" on a job listing
- **Progression**: Job detail → Application form → Standard fields (CV upload, contact info) → Custom questions → Validation → Confirm → Submit → Success notification
- **Success criteria**: Custom questions display correctly, all answer types validate properly, responses save with application, admins can view answers in candidate review

### Candidate Profile System
- **Functionality**: Comprehensive candidate profiles with photo upload, resume storage, work experience, education history, skills, and profile completion tracking
- **Purpose**: Allow candidates to maintain reusable professional profiles that enhance applications and enable recruiters to evaluate qualifications holistically
- **Trigger**: Candidate registers account or clicks "Mi Perfil" from navigation
- **Progression**: Profile page → View completion bar → Edit section (photo/experience/education) → Upload/fill data → Save → Visual confirmation → Progress updates
- **Success criteria**: Profile data persists across sessions, completion percentage calculates accurately, photos display as circular avatars, all sections editable and saveable

### Application Status Tracking
- **Functionality**: Multi-stage status pipeline (Pendiente → En Revisión → Entrevista → Prueba Técnica → Contratado/Rechazado) with visual indicators and automatic notifications
- **Purpose**: Provide transparency to candidates about their application progress and help administrators organize candidate pipeline efficiently
- **Trigger**: Admin changes application status in management panel or system automatically updates on action
- **Progression**: Applications list → Select candidate → Change status dropdown → Confirm → Status updates → Notification sent → Visual indicator changes → Timeline logged
- **Success criteria**: Status changes reflect immediately in both admin and candidate views, notifications trigger on changes, timeline maintains complete history, color coding matches status correctly

### Evaluation Management System
- **Functionality**: Schedule and track interviews, technical tests, and assessments with scoring capabilities, evaluator assignments, and structured feedback
- **Purpose**: Standardize evaluation processes, maintain organized records of candidate assessments, and facilitate collaborative hiring decisions
- **Trigger**: Admin clicks "Programar Evaluación" from candidate details
- **Progression**: Candidate view → Schedule evaluation → Select type/date/evaluator → Add notes → Save → Calendar entry created → Notification sent → Complete evaluation → Enter results → Update candidate status
- **Success criteria**: Evaluations link to correct candidates, calendar integrations work, evaluators receive notifications, scoring saves properly, evaluation history displays chronologically

### Comprehensive Candidate View (Admin)
- **Functionality**: Unified modal/page displaying complete candidate information including profile photo, CV download, work history, education, custom question responses, evaluation results, and internal notes
- **Purpose**: Provide recruiters with holistic candidate view for informed decision-making without navigating multiple screens
- **Trigger**: Admin clicks candidate name/row in Applications or Candidates section
- **Progression**: Applications list → Click candidate → Modal opens → Tabbed interface (Profile/Responses/Evaluations/Notes) → Navigate sections → Download CV → Add notes → Close or take action
- **Success criteria**: All candidate data loads correctly, tabs switch smoothly, CV downloads successfully, notes save properly, actions (status change, schedule evaluation) accessible from modal

### Notification System
- **Functionality**: Automated notifications for status changes plus manual messaging capability, with both in-app alerts and email delivery
- **Purpose**: Keep candidates informed of their application progress and enable HR to communicate important updates efficiently
- **Trigger**: Automatic on status change or admin manually sends message to candidate
- **Progression**: Status change → System generates notification → Saves to database → Displays in candidate notifications → Sends email → Candidate reads → Mark as read
- **Success criteria**: Notifications deliver reliably, unread count displays accurately, notification history maintained, manual messages send successfully, email integration works (or simulated)

### Admin User Management
- **Functionality**: CRUD for internal users with role assignment (Admin, Recruiter, Evaluator) and permission controls defining access levels
- **Purpose**: Support organizational hierarchy with appropriate access controls and collaboration among recruitment team members
- **Trigger**: Admin navigates to Users section and clicks "Agregar Usuario"
- **Progression**: Users list → Create form → Fill name/email/role → Set permissions → Save → Invite sent → New user logs in → Access restricted per role
- **Success criteria**: Users created successfully, roles enforce correct permissions, inactive users cannot log in, user list filterable and searchable

### Dashboard Analytics
- **Functionality**: Visual metrics displaying active jobs, total applications, pending interviews, hires, recent activity, and alerts for expiring jobs
- **Purpose**: Provide at-a-glance insights into recruitment health and highlight items requiring immediate attention
- **Trigger**: Admin logs in or navigates to Dashboard
- **Progression**: Login → Dashboard loads → Metrics calculate → Charts render → Alerts display → Admin reviews → Navigates to detailed sections
- **Success criteria**: Metrics calculate accurately from live data, charts responsive and clear, alerts actionable, dashboard loads quickly

## Edge Case Handling

- **Expired Jobs**: Automatically flag jobs past deadline with warning indicators, prevent new applications, optionally hide from public portal or display "Closed" badge
- **Duplicate Applications**: Detect when candidate attempts to apply twice to same job, show friendly message "Ya has postulado a esta oferta" and redirect to application status
- **Incomplete Profiles**: Allow candidates to start applications with partial profiles but incentivize completion with progress bar and "Completa tu perfil para destacar" prompts
- **Missing CV Files**: Validate CV upload before application submission, show clear error if missing, provide drag-and-drop and file browser options
- **Network Failures on Upload**: Implement retry logic for file uploads, show progress indicators, maintain form data if upload fails, display clear error messages
- **Concurrent Status Updates**: Handle race conditions when multiple admins update same application simultaneously with optimistic updates and conflict resolution
- **Invalid Custom Questions**: Validate admin input when creating questions, prevent empty questions, ensure multiple choice has at least 2 options
- **Deleted Jobs with Active Applications**: Maintain application records even when job deleted, show "Oferta eliminada" in candidate view, preserve data integrity
- **Large CV Files**: Enforce file size limits (5MB), validate file types (PDF, DOC, DOCX), provide clear feedback on rejection with size/type requirements
- **Browser Refresh Mid-Form**: Persist form data in temporary storage, offer "Recuperar datos" option on return, auto-save drafts for applications and profiles

## Design Direction

The design should evoke professional confidence with approachable warmth—think of a modern SaaS platform that respects institutional formality while embracing contemporary web aesthetics. A minimal interface with purposeful richness serves best: clean layouts with generous white space, strategic use of color to communicate status and hierarchy, and subtle animations that guide attention without distraction. The interface should feel like a premium recruitment tool that organizations are proud to brand as their own and candidates trust for transparency.

## Color Selection

**Analogous** (adjacent colors on the color wheel)
Using a harmonious blue-to-teal progression that communicates trust, professionalism, and forward-thinking innovation with enough variation to establish clear visual hierarchy while maintaining cohesive brand identity.

- **Primary Color**: Deep Corporate Blue `oklch(0.48 0.14 250)` - Establishes institutional credibility and professional authority, used for primary CTAs, navigation highlights, and key brand touchpoints
- **Secondary Colors**: 
  - Soft Blue `oklch(0.92 0.03 250)` - Background tints and card surfaces for subtle depth without overwhelming
  - Teal Accent `oklch(0.58 0.12 200)` - Secondary actions and progressive states to provide visual variety within the blue family
- **Accent Color**: Vibrant Teal `oklch(0.65 0.15 195)` - Dynamic CTAs, success states, and interactive element highlights to inject energy
- **Foreground/Background Pairings**:
  - Background `oklch(1 0 0)`: Dark Text `oklch(0.25 0.01 250)` - Ratio 14.2:1 ✓
  - Card `oklch(0.98 0.005 250)`: Dark Text `oklch(0.25 0.01 250)` - Ratio 13.1:1 ✓
  - Primary `oklch(0.48 0.14 250)`: White Text `oklch(1 0 0)` - Ratio 8.2:1 ✓
  - Secondary `oklch(0.92 0.03 250)`: Dark Text `oklch(0.25 0.01 250)` - Ratio 11.8:1 ✓
  - Accent `oklch(0.65 0.15 195)`: White Text `oklch(1 0 0)` - Ratio 5.1:1 ✓
  - Muted `oklch(0.93 0.01 250)`: Muted Text `oklch(0.5 0.02 250)` - Ratio 6.5:1 ✓

## Font Selection

**Nunito Sans** for its humanist warmth balanced with professional clarity—rounded terminals soften the corporate feel while maintaining excellent legibility across all sizes, with robust weight variations supporting clear typographic hierarchy from dashboard metrics to form labels.

- **Typographic Hierarchy**: 
  - H1 (Page Titles): Nunito Sans SemiBold/32px/tight tracking/-0.02em - Dashboard, main section headers
  - H2 (Section Headers): Nunito Sans SemiBold/24px/normal tracking/0em - Card titles, modal headers  
  - H3 (Subsection Headers): Nunito Sans SemiBold/18px/normal tracking/0em - Form sections, table headers
  - Body (Primary Content): Nunito Sans Regular/16px/relaxed leading/1.6 - Descriptions, form inputs, table content
  - Small (Supporting Text): Nunito Sans Regular/14px/normal leading/1.5 - Labels, captions, metadata
  - Tiny (Micro Text): Nunito Sans Medium/12px/tight leading/1.3 - Badges, timestamps, helper text

## Animations

Animations should feel purposeful and refined—present but never performative. They exist to guide attention, communicate state changes, and provide satisfying feedback rather than to impress. Think Apple's Human Interface Guidelines: animations should be fast enough not to delay user actions (150-300ms typical) but slow enough to be perceived as smooth transitions rather than jarring jumps.

- **Purposeful Meaning**: 
  - Modal entrances use gentle scale + fade (0.95 → 1.0 scale) to feel like content coming forward
  - Status changes animate color transitions smoothly to reinforce the change has occurred
  - File uploads show progress bars with subtle pulse on completion
  - Notifications slide in from top-right with gentle bounce to feel friendly not aggressive
  - Hover states scale buttons slightly (1.0 → 1.02) and lift cards with shadow increase
  
- **Hierarchy of Movement**: 
  - Primary CTAs deserve micro-interactions (hover glow, active press depression)
  - Navigation transitions should be instant for responsive feel
  - Form submissions show loading states but don't lock entire UI
  - Data tables load with staggered row fade-ins for polish without delay
  - Critical actions (delete, reject) pause with confirm modals that fade backdrop
  - Success states celebrate briefly with checkmark animation then return to flow

## Component Selection

- **Components**: 
  - **Dialogs/Modals**: Shadcn Dialog for job creation, candidate details, evaluation scheduling with full-screen mobile breakpoints
  - **Cards**: Shadcn Card with hover elevation for job listings, dashboard metrics, candidate cards
  - **Forms**: Shadcn Form + React Hook Form for all input scenarios with inline validation and error states
  - **Tables**: Shadcn Table for applications, jobs, users lists with sortable columns and row actions
  - **Select/Dropdowns**: Shadcn Select for status changes, filters, form choices with search for long lists
  - **Badges**: Shadcn Badge for status indicators (with custom color variants per status type)
  - **Buttons**: Shadcn Button with Primary (filled), Secondary (outline), Ghost (text) variants
  - **Tabs**: Shadcn Tabs for candidate detail sections, profile organization, dashboard views
  - **Progress**: Shadcn Progress for profile completion, file uploads, multi-step forms
  - **Toasts**: Sonner for all notifications with success/error/info variants
  - **Avatar**: Shadcn Avatar for profile photos with fallback initials
  - **Calendar**: Shadcn Calendar for evaluation scheduling and deadline selection
  - **Textarea**: Shadcn Textarea for descriptions, requirements, notes with character counts
  
- **Customizations**: 
  - **File Upload Component**: Custom drag-and-drop zone with preview, progress, and validation not provided by Shadcn
  - **Question Builder**: Custom admin interface to create dynamic form questions with type selection and option management
  - **Timeline Component**: Custom vertical timeline for candidate recruitment journey not in Shadcn base
  - **Image Upload with Crop**: Custom component for profile photos and job banners with client-side preview and aspect ratio control
  - **Status Change Widget**: Custom dropdown that combines status selection with note input and confirmation in one flow
  
- **States**: 
  - Buttons: Default → Hover (slight scale + shadow) → Active (pressed depression) → Loading (spinner) → Success (checkmark flash) → Disabled (muted opacity)
  - Inputs: Default → Focus (ring glow) → Filled (persistent ring) → Error (red ring + shake) → Success (green border) → Disabled (gray background)
  - Cards: Default → Hover (elevation increase) → Selected (border highlight) → Loading (pulse skeleton)
  - Dropdowns: Closed → Opening (scale from trigger) → Open (full scale) → Selecting (item highlight) → Closing (scale to trigger)
  
- **Icon Selection**: 
  - Phosphor Icons with duotone weight for visual interest
  - House (dashboard), Briefcase (jobs), UserList (applications), ClipboardText (evaluations), User (candidates), Bell (notifications)
  - Plus (create), PencilSimple (edit), Trash (delete), Eye/EyeSlash (visibility), Calendar (schedule), Download (CV), Upload (files)
  - CheckCircle (success), XCircle (error), Warning (alerts), Info (tips), ArrowRight (navigation), CaretDown (dropdowns)
  
- **Spacing**: 
  - Container padding: p-4 mobile, p-8 desktop
  - Card internal: p-6 for content areas
  - Form fields: gap-6 between field groups, gap-2 between label and input
  - Button internal: px-6 py-3 for primary, px-4 py-2 for secondary
  - Section separation: mb-8 between major sections, mb-4 between related groups
  - Grid gaps: gap-6 for card grids, gap-4 for form layouts
  
- **Mobile**: 
  - Navigation collapses to horizontal scrolling tabs on mobile with burger menu for secondary actions
  - Tables transform to stacked cards showing key info with expand for full details
  - Modals become full-screen sheets on mobile for better focus and input accessibility
  - Forms adjust to single column with full-width inputs
  - Dashboard metrics stack vertically with full-width cards
  - File uploads optimize for camera access on mobile devices
  - Fixed bottom action bars on mobile for primary CTAs (submit, save) to prevent keyboard obstruction
