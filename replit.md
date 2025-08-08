# Property Management Dashboard

## Overview

This is a full-stack property management dashboard application built for Augusta Rental Homes. The system provides real-time operational metrics, vacancy tracking, and integrations with property management tools. It features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data persistence and Drizzle ORM for database operations.

### Recent Changes
- Successfully integrated Buildium API with full pagination support (August 2025)
- Live occupancy data now pulling all 1,121 properties and 2,655 units
- Accurate property classification: 902 SFR properties, 219 MF properties
- Real-time occupancy calculation: 55.7% total, 40.9% SFR, 63.4% MF
- Implemented pagination to handle 1000+ record limits

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts for data visualization components

The frontend follows a component-based architecture with a clear separation between UI components, business logic, and data fetching. The dashboard is responsive and uses a tab-based filtering system to switch between different property types (All Properties, Single Family, Multi-Family).

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development

The backend implements a clean architecture with:
- Route handlers in `server/routes.ts`
- Storage abstraction in `server/storage.ts` 
- Shared schema definitions in `shared/schema.ts`
- Development server with Vite integration for hot module replacement

### Database Schema
The application uses three main entities:
- **Users**: Basic user management with username/password authentication
- **Metrics**: Property management metrics with support for different property types and metric categories
- **VacancyDistribution**: Tracks vacancy duration patterns across properties

All tables include UUID primary keys and timestamp tracking for data auditing.

### Data Layer Design
The storage layer uses an interface-based approach allowing for different implementations:
- `IStorage` interface defines all database operations
- `MemStorage` provides in-memory storage for development with realistic mock data
- Schema validation using Zod for type safety and runtime validation

### Development Environment
- **Hot Reload**: Vite development server with HMR support
- **Type Safety**: Full TypeScript coverage across client, server, and shared code
- **Path Aliases**: Configured aliases for clean imports (@/, @shared/, @assets/)
- **Build Process**: Separate build pipelines for client (Vite) and server (esbuild)

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver optimized for serverless environments
- **drizzle-orm**: Type-safe ORM with PostgreSQL support
- **drizzle-kit**: Database migration and schema management tools

### UI and Styling Dependencies  
- **@radix-ui/***: Comprehensive set of unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework with custom design system
- **class-variance-authority**: Utility for creating variant-based component APIs
- **lucide-react**: Icon library with consistent design system

### Data Management
- **@tanstack/react-query**: Server state management with caching and synchronization
- **zod**: Schema validation for runtime type checking
- **react-hook-form**: Forms with validation integration

### Development Tools
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution environment for Node.js
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Development tooling integration

### Chart and Visualization
- **recharts**: Composable charting library built on React and D3
- **date-fns**: Modern JavaScript date utility library

The application is designed to be easily deployable on platforms like Replit with minimal configuration while maintaining production-ready architecture patterns.