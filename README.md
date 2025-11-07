# 🎯 Coosajer Empleos - AI-Powered Recruitment Platform

A comprehensive institutional recruitment management system powered by artificial intelligence, designed to transform the hiring process from job posting to candidate onboarding.

![Status](https://img.shields.io/badge/status-active-success.svg)
![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![AI Powered](https://img.shields.io/badge/AI-powered-purple.svg)

---

## 🌟 Overview

Coosajer Empleos is a modern, full-featured recruitment platform that streamlines the entire hiring lifecycle. Built with React, TypeScript, and integrated with OpenAI, it provides intelligent candidate evaluation, comprehensive process tracking, and data-driven insights for strategic hiring decisions.

### 🎯 Key Capabilities

- **🤖 AI-Powered Analysis**: Automatically evaluate candidates with intelligent CV parsing and match scoring
- **📊 Advanced Analytics**: Real-time metrics dashboard with recruitment insights and trends
- **🔄 Process Tracking**: Multi-stage pipeline with automatic notifications at each step
- **🧠 Psychometric Integration**: Seamless connection with external testing platforms
- **📈 Data Export**: Advanced filtering and export to CSV/JSON for reporting
- **🔐 User Management**: Complete authentication system with registration and password recovery
- **💼 Job Management**: Track positions from active to filled with talent banking

---

## ✨ Core Features

### 1. Intelligent Candidate Evaluation
- Automatic skills extraction from candidate profiles
- AI-generated compatibility scores (0-100)
- Strengths and concerns identification
- Hiring recommendations based on analysis
- Results persist for future reference

### 2. Comprehensive Process Tracking
- 6-stage recruitment pipeline (Pending → Review → Interview → Test → Hired/Rejected)
- Visual status indicators with color coding
- Complete timeline history for audit trails
- Automatic notifications to candidates at each stage
- Progress visibility for both admins and candidates

### 3. Advanced Database Export
- Filter by status, category, date range, skills, and experience
- Export to CSV or JSON formats
- Combine multiple criteria for precise results
- Includes complete candidate information
- Automated file naming with timestamps

### 4. Psychometric Test Integration
- Send tests with external platform URLs
- Track test status (Pending → Sent → In Progress → Completed)
- Store results and scores
- Automatic candidate notifications
- Multiple tests per candidate support

### 5. Analytics & Reporting Dashboard
- Total applications and monthly trends
- Applications by status distribution
- Top 5 most requested positions
- Average time to hire metrics
- Conversion rate analysis (pending → interview → hired)

### 6. User Account Management
- Self-service registration for administrators
- Secure login with credential validation
- Password recovery with simulated email
- Show/hide password functionality
- Multiple administrator support

### 7. Job Position Management
- Clear status tracking (Active, Filled, Closed, Draft)
- Visual status badges on listings
- Talent banking from filled positions
- Category organization
- Deadline tracking with alerts

---

## 🛠️ Technology Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4 with custom theme
- **UI Components**: Shadcn UI v4
- **Icons**: Phosphor Icons
- **Animations**: Framer Motion
- **AI Integration**: OpenAI API via Spark SDK
- **Data Persistence**: Spark KV Storage
- **Forms**: React Hook Form with Zod validation
- **Notifications**: Sonner toasts
- **Build Tool**: Vite

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Spark development environment

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### First Time Setup

1. Navigate to the application
2. Click the "Registrar" tab to create an administrator account
3. Enter your name, email, and password
4. Login with your new credentials
5. Start by creating job categories in the Categories section
6. Post your first job in the Jobs section
7. Begin receiving and evaluating applications

### Demo Credentials

For quick testing, use the pre-configured account:
- **Email**: admin@coosajer.com
- **Password**: admin123

---

## 📖 User Guide

### For Administrators

#### Managing Jobs
1. Navigate to "Ofertas" (Jobs)
2. Click "Nueva Oferta" to create a job posting
3. Fill in title, description, requirements, and deadline
4. Select category and contract type
5. Set status (Active, Draft, etc.)
6. Save and publish

#### Evaluating Candidates
1. Go to "Candidatos" (Candidates) section
2. Click on a candidate to view full profile
3. Click "Analizar con IA" for automatic evaluation
4. Review AI-generated insights:
   - Match score
   - Identified skills
   - Strengths and concerns
   - Hiring recommendation
5. Update status as candidate progresses
6. Send psychometric tests if needed

#### Exporting Data
1. Navigate to "Candidatos" section
2. Click "Exportar Base de Datos"
3. Set filters:
   - Select status (pending, hired, etc.)
   - Choose categories
   - Set date range
   - Add skill requirements
   - Specify minimum experience
4. Choose format (CSV or JSON)
5. Click export - file downloads automatically

#### Tracking Progress
1. View "Dashboard" for overview metrics
2. Check "Métricas" for detailed analytics
3. Monitor application pipeline in "Postulaciones"
4. Review interview schedules in "Evaluaciones"
5. Manage talent bank for future opportunities

---

## 🔧 Configuration

### Theme Customization

Edit `src/index.css` to customize colors:

```css
:root {
  --primary: oklch(0.35 0.12 250);  /* Deep blue */
  --accent: oklch(0.58 0.12 145);   /* Teal */
  --radius: 0.75rem;                /* Border radius */
}
```

### AI Analysis Configuration

AI candidate analysis uses the Spark SDK. Customize prompts in `src/App.tsx`:

```typescript
const promptText = `
  Analiza el siguiente perfil...
  [Your custom analysis criteria]
`
```

---

## 📊 Data Structure

### Key Entities

- **JobOffer**: Job postings with status, category, and requirements
- **Candidate**: Applicant profiles with skills, experience, and education
- **Application**: Links candidates to jobs with status tracking
- **Evaluation**: Interview and test records
- **AIAnalysis**: AI-generated candidate evaluations
- **PsychometricTest**: External test tracking
- **Notification**: Automated and manual messages

All data persists using Spark KV storage for reliability and scalability.

---

## 🎨 Design Philosophy

The platform follows modern design principles:

- **Simplicity Through Reduction**: Essential features front and center
- **Material Honesty**: UI elements that feel true to their digital nature
- **Purposeful Animation**: Motion that guides without distracting
- **Typographic Excellence**: Clear hierarchy with Nunito Sans
- **Color as Communication**: Status and importance through color
- **Spatial Awareness**: Generous white space and logical grouping

---

## 📱 Mobile Support

Fully responsive design:
- Collapsible navigation on mobile
- Touch-friendly interface elements
- Tables convert to cards on small screens
- Optimized forms for mobile input
- Full-screen modals for better focus

---

## 🔒 Security Features

- Secure credential storage using KV persistence
- Password validation (minimum 6 characters)
- Email format validation
- Session management
- Account-based access control

---

## 🧪 Testing

The platform has been tested for:
- ✅ Feature functionality across scenarios
- ✅ Data persistence and integrity
- ✅ Error handling and edge cases
- ✅ User experience and usability
- ✅ Performance with realistic data
- ✅ Mobile responsiveness
- ✅ Browser compatibility

---

## 📈 Roadmap

### Planned Enhancements
- [ ] Candidate self-service portal
- [ ] Real email service integration
- [ ] Calendar synchronization
- [ ] Bulk candidate actions
- [ ] Custom notification templates
- [ ] Advanced AI features (salary recommendations, skill gap analysis)
- [ ] Custom report builder
- [ ] Mobile native apps
- [ ] Video interview integration
- [ ] Team collaboration tools

---

## 🤝 Contributing

This is a proprietary project for Coosajer. For internal contributions:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit for review

---

## 📄 Documentation

- **[FEATURES.md](./FEATURES.md)**: Comprehensive feature documentation
- **[PRD.md](./PRD.md)**: Product requirements and design decisions
- **Component Docs**: See `src/components/` for component-level documentation

---

## 🆘 Support

For issues, questions, or feature requests:
- Check the [FEATURES.md](./FEATURES.md) documentation
- Review component implementations in `src/components/`
- Contact the development team

---

## 📜 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.

---

## 🎉 Acknowledgments

Built with:
- [React](https://react.dev/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Shadcn UI](https://ui.shadcn.com/) - Component library
- [OpenAI](https://openai.com/) - AI capabilities
- [Spark](https://github.com/features/spark) - Development platform

---

**Made with ❤️ for modern recruitment**
