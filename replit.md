# ICM InfoWorks Ruby Visualizer

## Overview

This is an interactive visualization and documentation tool for analyzing Ruby code workflows in ICM InfoWorks. The application parses Ruby files to extract workflow steps, generate visual diagrams of the process flow, and create editable markdown documentation. It allows engineers to understand Ruby script structure by visualizing the sequence of operations, identifying key steps, and automatically generating comprehensive documentation that can be customized and exported.

The application serves as both a code analysis and documentation tool, helping engineers quickly understand complex Ruby automation scripts by parsing the source code and presenting it in an intuitive, interactive format.

## Recent Changes

### November 19, 2025 - Exchange Script Node Enhancements
- **Enhanced all 12 Exchange script workflow nodes** with detailed code annotations from source Ruby file
- **Added helper function definitions** (log, is_label_list_empty?) to the retrieve_config node, making dependencies clear
- **Added context comments** to each Exchange node documenting variables and functions in scope
- **Verified API accuracy** for all ICM Ruby Exchange script methods:
  - WSApplication.open for database connection (Exchange-specific)
  - model_group.import_all_sw_model_objects with correct 4-parameter signature
  - net.row_objects for object counting
  - net.commit for saving changes
- **Fixed node selection bug** where clicking nodes wouldn't update metadata panel after changing phase filters
- **Fixed TypeScript error** in WorkflowCanvas edge highlighting logic

### Previous Enhancements
- Comprehensive UX improvements: onboarding dialog, auto-selected Start node, phase filters, numbered step list sidebar, hover tooltips
- Enhanced all 24 UI script workflow nodes with detailed code annotations
- Corrected ICM Ruby API syntax: WSApplication.message_box now uses correct 3-parameter signature throughout

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript using Vite as the build tool

**Routing**: Wouter for lightweight client-side routing

**State Management**: TanStack Query (React Query) for server state management with a configured query client that handles API requests, caching, and error handling. No global client state management library is used beyond React Query.

**UI Component Library**: Shadcn/ui (Radix UI primitives with Tailwind CSS styling) following the "new-york" style variant. Components are locally installed in `client/src/components/ui/` for full customization.

**Styling Strategy**: Tailwind CSS with custom design tokens defined in CSS variables (HSL color space). The design system includes custom font families (Inter for headings, Roboto for UI text, Source Code Pro for technical content) and follows engineering-focused aesthetics as specified in `design_guidelines.md`.

**Canvas Rendering**: Custom SVG-based canvas implementation for workflow visualization with pan/zoom capabilities. Nodes and edges are rendered as SVG elements with interactive behaviors (selection, hover states).

### Backend Architecture

**Runtime**: Node.js with Express.js server

**API Pattern**: RESTful HTTP endpoints serving JSON data
- `/api/workflow` - Returns complete workflow definition (nodes and edges)
- `/api/logs` - Returns execution log entries

**Data Storage**: In-memory storage implementation (`MemStorage` class) that initializes workflow data and logs on server startup. The storage interface (`IStorage`) is designed to be replaceable with a database-backed implementation.

**Development Setup**: Vite middleware integration for hot module replacement during development. Production build generates static assets served by Express.

**Type Safety**: Shared TypeScript types between client and server via `shared/schema.ts` using Zod for runtime validation.

### Data Storage Solutions

**Current Implementation**: In-memory storage with hardcoded workflow definitions and logs in `server/storage.ts`

**Database Configuration**: Drizzle ORM configured for PostgreSQL via `drizzle.config.ts` with Neon serverless driver. Database schema defined in `shared/schema.ts` but not yet implemented with actual tables. The application is prepared for PostgreSQL integration but currently operates without persistent storage.

**Session Management**: Session infrastructure configured with `connect-pg-simple` for PostgreSQL-backed sessions (when database is connected).

### Key Architectural Patterns

**Schema-First Design**: Zod schemas in `shared/schema.ts` define the data contracts:
- `workflowNodeSchema` - Workflow step definitions with type, label, position, status, and script context
- `workflowEdgeSchema` - Connections between nodes with conditional/primary/secondary types
- `fileConfigSchema` - Configuration for SWMM input files being imported
- `importStatisticsSchema` - Metrics tracking import progress and results
- `logEntrySchema` - Execution log records

**Component Composition**: Workflow visualization built from composable components:
- `WorkflowCanvas` - Container managing pan/zoom and SVG rendering
- `WorkflowNode` - Individual node rendering with type-specific styling
- `WorkflowEdge` - Connection rendering with arrow markers
- `MetadataPanel` - Tabbed interface for node details, file lists, statistics, and logs
- `LegendPanel` - Static reference for node types and visual conventions

**Separation of Concerns**: Clear boundaries between:
- UI components (client/src/components/)
- Page-level containers (client/src/pages/)
- Server routes (server/routes.ts)
- Data access (server/storage.ts)
- Shared contracts (shared/schema.ts)

### Visualization Logic

Workflow nodes have absolute positioning (x, y coordinates) stored in the data model. The canvas applies transformations for pan (translate) and zoom (scale). Edge connections are calculated dynamically based on source/target node positions using straight lines with right-angle bends at midpoints.

Node types render with different visual treatments:
- Start/End: Circular shapes with primary color borders
- Process: Rectangular with script-context-based border colors (UI = blue, Exchange = green)
- Decision: Diamond shapes with warning color
- Data: Document-style shapes with muted colors

Status indicators (success, error, warning, processing) overlay on nodes using icon badges and color coding aligned with the design system's semantic color tokens.

## External Dependencies

### UI Component Library
- **Radix UI Primitives**: Comprehensive set of unstyled, accessible components (dialog, dropdown, tooltip, tabs, etc.) providing foundation for the Shadcn/ui implementation
- **cmdk**: Command palette component for potential future command interface
- **embla-carousel-react**: Carousel functionality (available but not currently used in workflow view)
- **vaul**: Drawer component library
- **lucide-react**: Icon library providing consistent iconography throughout the application

### Styling and Utilities
- **Tailwind CSS**: Utility-first CSS framework with custom configuration in `tailwind.config.ts`
- **class-variance-authority**: Type-safe variant management for component styling
- **clsx** + **tailwind-merge**: Class name composition utilities
- **date-fns**: Date formatting and manipulation for log timestamps

### State Management and Data Fetching
- **@tanstack/react-query**: Server state management with caching, refetching, and synchronization
- **wouter**: Minimal routing library (1.2KB alternative to React Router)

### Forms and Validation
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Validation resolver integration
- **zod**: Schema validation library used for data contracts and runtime type checking
- **drizzle-zod**: Generates Zod schemas from Drizzle ORM table definitions

### Database and ORM
- **drizzle-orm**: TypeScript ORM for SQL databases
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver for edge runtime compatibility
- **drizzle-kit**: CLI tool for database migrations and schema management
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Development Tools
- **Vite**: Build tool and dev server with fast HMR
- **@vitejs/plugin-react**: React plugin for Vite with Fast Refresh
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Replit integration for code navigation
- **TypeScript**: Type system with strict mode enabled
- **esbuild**: Fast bundler for server-side code in production builds

### Server Framework
- **Express.js**: Web server framework
- **nanoid**: Unique ID generation for session management

### Font Integration
Google Fonts CDN loads three font families:
- Inter (weights 400, 500, 600, 700) for headings
- Roboto (weights 300, 400, 500, 700) for body text
- Source Code Pro (weights 400, 500, 600) for code/technical content