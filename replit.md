# Overview

Rotted Capes Character Creator is a web application for creating characters for the tabletop RPG "Rotted Capes" - a post-apocalyptic superhero game set in a zombie-infested world. The application provides a step-by-step character creation wizard that guides users through building B-List superheroes who survive in a world where the A-List heroes have fallen to zombies.

The application features a comprehensive character creation system including origin selection, archetype choice, ability score allocation, skill/feat selection, power assignment, weakness definition, gear selection, and final review with PDF export capabilities. All game rules data is stored in JSON files and seeded into a PostgreSQL database for efficient querying.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with Vite and TypeScript for fast development and optimal bundling
- **Styling**: Tailwind CSS with shadcn/ui components for consistent, modern UI design
- **State Management**: Context API with useCharacter hook for character creation state, auto-saved to localStorage
- **Animations**: Framer Motion for smooth transitions between wizard steps
- **PDF Generation**: jsPDF with html2canvas for character sheet export functionality

## Backend Architecture
- **Runtime**: Node.js with Express.js as the web framework
- **Database ORM**: Drizzle ORM for type-safe database operations and migrations
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple
- **Build System**: ESBuild for server-side bundling, Vite for client-side development

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless connection pooling
- **Schema Management**: Drizzle migrations for version-controlled database schema
- **Local Storage**: Browser localStorage for auto-saving character creation progress
- **Static Data**: JSON files in `/client/src/rules/` containing game rules (origins, archetypes, feats, skills, powers, gear)

## Authentication and Authorization
- **Authentication Provider**: Firebase Authentication with server-side token verification
- **Session Storage**: PostgreSQL-backed Express sessions
- **Authorization**: Firebase Admin SDK for token validation on protected routes

# External Dependencies

## Third-Party Services
- **Neon Database**: Serverless PostgreSQL hosting with WebSocket connections
- **Firebase**: Authentication service and project configuration
- **Google Analytics**: Optional user analytics tracking

## Key Libraries and Frameworks
- **UI Components**: Radix UI primitives with shadcn/ui styling system
- **Form Handling**: React Hook Form with Zod validation schemas
- **Data Fetching**: TanStack Query for server state management with Axios HTTP client
- **Utilities**: class-variance-authority for conditional styling, clsx for class composition
- **Development**: TypeScript for type safety, cross-env for environment variable management

## Build and Development Tools
- **Bundling**: Vite for frontend, ESBuild for backend production builds
- **CSS Processing**: PostCSS with Autoprefixer for browser compatibility
- **Database**: Drizzle Kit for migrations and database management
- **Testing**: Custom test runner with TSX for TypeScript execution